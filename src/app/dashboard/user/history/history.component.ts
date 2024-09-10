import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { RequestHistory } from '../../../shared/interfaces/request-history.interface';
import { AuthService } from '../../../shared/services/auth.service';
import { ProductCategoryService } from '../../../shared/services/product-category.service';
import { url } from '../../../shared/data/api';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
})
export class HistoryComponent {
  isLoggedIn: boolean = false;
  userID: string = '';

  requests: RequestHistory[] = [];
  selectedRequestIndex: number | null = null;

  isLoading: boolean = true;

  constructor(
    private authService: AuthService,
    private historyService: ProductCategoryService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isLoggedIn = this.authService.IsLoggedIn();
      const user = this.authService.GetUserInfo();
      if (this.isLoggedIn) {
        this.userID = user.UserId;
        this.historyService.getHistory(url.history, this.userID).subscribe(
          (res) => {
            this.isLoading = false;
            this.requests = res;
            this.sortRequestsByDate();
          },
          (error) => {
            console.error(error);
            this.isLoading = false;
          }
        );
      }
    }
  }

  formatDate(isoString: string): string {
    const date = new Date(isoString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  transformRequestType(value: number): string {
    switch (value) {
      case 1:
        return 'Content';
      case 2:
        return 'Translate';
      case 3:
        return 'Copyright';
      case 4:
        return 'Video Script';
      case 5:
        return 'Email';
      default:
        return 'Unknown';
    }
  }

  sortRequestsByDate() {
    this.requests.sort(
      (a, b) =>
        new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    );
  }

  showResponse(index: number): void {
    this.selectedRequestIndex =
      this.selectedRequestIndex === index ? null : index; // Toggle visibility
  }

  getProductName(requestJson: string): string {
    try {
      const parsedRequest = JSON.parse(requestJson);
      return parsedRequest.ProductName || 'No Product Name';
    } catch (error) {
      console.error('Error parsing request JSON', error);
      return 'Invalid JSON';
    }
  }

  getDescription(requestJson: string): string {
    try {
      const parsedRequest = JSON.parse(requestJson);
      return parsedRequest.Description || 'No Text For Translation';
    } catch (error) {
      console.error('Error parsing request JSON', error);
      return 'Invalid JSON';
    }
  }

  getEmail(requestJson: string): string {
    try {
      const parsedRequest = JSON.parse(requestJson);
      return parsedRequest.Email || 'No Text For Translation';
    } catch (error) {
      console.error('Error parsing request JSON', error);
      return 'Invalid JSON';
    }
  }

  getResponseText(responseJson: string): string {
    try {
      const parsedRequest = JSON.parse(responseJson);
      return parsedRequest.Text || 'No Text';
    } catch (error) {
      console.error('Error parsing request JSON', error);
      return 'Invalid JSON';
    }
  }
}
