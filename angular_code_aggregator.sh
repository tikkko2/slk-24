#!/bin/bash

# Output file name
OUTPUT_FILE="angular_project_code_aggregation.txt"

echo "Starting Angular project code aggregation script..."
echo "Will save output to: $OUTPUT_FILE"

# Clear or create the output file
> "$OUTPUT_FILE"
echo "Created empty output file"

# Function to check if a file should be processed
should_process_file() {
    local file="$1"
    # List of extensions to process - Angular-specific extensions included
    local valid_extensions="\.(ts|js|html|scss|css|json)$"
    
    if [[ $file =~ $valid_extensions ]]; then
        # Exclude files in node_modules, .angular, dist, and other common excludes
        if [[ $file != *"node_modules"* ]] && 
           [[ $file != *".angular"* ]] && 
           [[ $file != *"dist"* ]] && 
           [[ $file != *".git"* ]] && 
           [[ $file != *"coverage"* ]] &&
           [[ $file != *"e2e"* ]] &&
           [[ $file != *"package-lock.json"* ]] &&
           [[ $file != *"yarn.lock"* ]]; then
            # Include only src files based on the project structure
            if [[ $file == *"src"* ]]; then
                return 0 # true
            fi
        fi
    fi
    return 1 # false
}

echo "Searching for Angular project files..."
file_count=0

# Find and process all relevant files
while IFS= read -r -d '' file; do
    if should_process_file "$file"; then
        echo "Processing: $file"
        # Remove leading './' from the file path
        clean_path=${file#./}
        
        # Write file path with file type indicator
        file_type=""
        if [[ $file == *.ts ]]; then
            if [[ $file == *.spec.ts ]]; then
                file_type="[TEST]"
            elif [[ $file == *.module.ts ]]; then
                file_type="[MODULE]"
            elif [[ $file == *.component.ts ]]; then
                file_type="[COMPONENT]"
            elif [[ $file == *.service.ts ]]; then
                file_type="[SERVICE]"
            else
                file_type="[TS]"
            fi
        elif [[ $file == *.html ]]; then
            file_type="[HTML]"
        elif [[ $file == *.scss || $file == *.css ]]; then
            file_type="[STYLE]"
        elif [[ $file == *.json ]]; then
            file_type="[CONFIG]"
        fi
        
        echo -e "\n=== File: $clean_path $file_type ===" >> "$OUTPUT_FILE"
        echo -e "----------------------------------------" >> "$OUTPUT_FILE"
        
        # Process file content based on type
        if [[ $file == *.json ]]; then
            # For JSON files, we could prettify them but for consistency we'll just include as-is
            cat "$file" >> "$OUTPUT_FILE"
        else
            cat "$file" >> "$OUTPUT_FILE"
        fi
        
        echo -e "\n----------------------------------------\n" >> "$OUTPUT_FILE"
        ((file_count++))
    fi
done < <(find . -type f -print0)

echo "Processing complete!"
echo "Total files processed: $file_count"chmod +x angular_code_aggregator.sh
echo "Output saved to: $OUTPUT_FILE"

# Generate summary of component types
echo -e "\n\n=== Project Summary ===" >> "$OUTPUT_FILE"
echo -e "----------------------------------------" >> "$OUTPUT_FILE"
echo -e "Components: $(grep -c "\.component\.ts" <<< "$(find . -name "*.component.ts" | grep -v "node_modules" | grep -v "dist")")" >> "$OUTPUT_FILE"
echo -e "Services: $(grep -c "\.service\.ts" <<< "$(find . -name "*.service.ts" | grep -v "node_modules" | grep -v "dist")")" >> "$OUTPUT_FILE"
echo -e "Modules: $(grep -c "\.module\.ts" <<< "$(find . -name "*.module.ts" | grep -v "node_modules" | grep -v "dist")")" >> "$OUTPUT_FILE"
echo -e "HTML Templates: $(grep -c "\.html" <<< "$(find . -name "*.html" | grep -v "node_modules" | grep -v "dist")")" >> "$OUTPUT_FILE"
echo -e "Style Files: $(grep -c "\.(scss|css)$" <<< "$(find . -name "*.scss" -o -name "*.css" | grep -v "node_modules" | grep -v "dist")")" >> "$OUTPUT_FILE"

if [ -f "$OUTPUT_FILE" ]; then
    echo "Output file size: $(wc -c < "$OUTPUT_FILE") bytes"
    echo "Output file line count: $(wc -l < "$OUTPUT_FILE") lines"
else
    echo "Error: Output file was not created!"
fi