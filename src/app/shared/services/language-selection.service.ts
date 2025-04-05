import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageSelectionService {
  // Service-specific keys
  private readonly TEXT_SOURCE_LANGUAGE_KEY = 'textSelectedSourceLanguage';
  private readonly TEXT_TARGET_LANGUAGE_KEY = 'textSelectedTargetLanguage';
  
  private readonly DOC_SOURCE_LANGUAGE_KEY = 'docSelectedSourceLanguage';
  private readonly DOC_TARGET_LANGUAGE_KEY = 'docSelectedTargetLanguage';
  
  private readonly IMAGE_SOURCE_LANGUAGE_KEY = 'imageSelectedSourceLanguage';
  private readonly IMAGE_TARGET_LANGUAGE_KEY = 'imageSelectedTargetLanguage';
  
  // Service-specific subjects
  private textSourceLanguageSubject = new BehaviorSubject<string>('');
  private textTargetLanguageSubject = new BehaviorSubject<string>('');
  
  private docSourceLanguageSubject = new BehaviorSubject<string>('');
  private docTargetLanguageSubject = new BehaviorSubject<string>('');
  
  private imageSourceLanguageSubject = new BehaviorSubject<string>('');
  private imageTargetLanguageSubject = new BehaviorSubject<string>('');

  constructor() {
    // Initialize from session storage if available
    this.loadSavedLanguages();
  }

  private loadSavedLanguages() {
    // Text service
    const savedTextSourceLang = sessionStorage.getItem(this.TEXT_SOURCE_LANGUAGE_KEY);
    const savedTextTargetLang = sessionStorage.getItem(this.TEXT_TARGET_LANGUAGE_KEY);
    
    if (savedTextSourceLang) {
      this.textSourceLanguageSubject.next(savedTextSourceLang);
    }
    if (savedTextTargetLang) {
      this.textTargetLanguageSubject.next(savedTextTargetLang);
    }
    
    // Doc service
    const savedDocSourceLang = sessionStorage.getItem(this.DOC_SOURCE_LANGUAGE_KEY);
    const savedDocTargetLang = sessionStorage.getItem(this.DOC_TARGET_LANGUAGE_KEY);
    
    if (savedDocSourceLang) {
      this.docSourceLanguageSubject.next(savedDocSourceLang);
    }
    if (savedDocTargetLang) {
      this.docTargetLanguageSubject.next(savedDocTargetLang);
    }
    
    // Image service
    const savedImageSourceLang = sessionStorage.getItem(this.IMAGE_SOURCE_LANGUAGE_KEY);
    const savedImageTargetLang = sessionStorage.getItem(this.IMAGE_TARGET_LANGUAGE_KEY);
    
    if (savedImageSourceLang) {
      this.imageSourceLanguageSubject.next(savedImageSourceLang);
    }
    if (savedImageTargetLang) {
      this.imageTargetLanguageSubject.next(savedImageTargetLang);
    }
  }

  // Text service methods
  setTextSourceLanguage(languageId: string) {
    sessionStorage.setItem(this.TEXT_SOURCE_LANGUAGE_KEY, languageId);
    this.textSourceLanguageSubject.next(languageId);
  }

  setTextTargetLanguage(languageId: string) {
    sessionStorage.setItem(this.TEXT_TARGET_LANGUAGE_KEY, languageId);
    this.textTargetLanguageSubject.next(languageId);
  }

  getTextSourceLanguage() {
    return this.textSourceLanguageSubject.asObservable();
  }

  getTextTargetLanguage() {
    return this.textTargetLanguageSubject.asObservable();
  }

  // Doc service methods
  setDocSourceLanguage(languageId: string) {
    sessionStorage.setItem(this.DOC_SOURCE_LANGUAGE_KEY, languageId);
    this.docSourceLanguageSubject.next(languageId);
  }

  setDocTargetLanguage(languageId: string) {
    sessionStorage.setItem(this.DOC_TARGET_LANGUAGE_KEY, languageId);
    this.docTargetLanguageSubject.next(languageId);
  }

  getDocSourceLanguage() {
    return this.docSourceLanguageSubject.asObservable();
  }

  getDocTargetLanguage() {
    return this.docTargetLanguageSubject.asObservable();
  }

  // Image service methods
  setImageSourceLanguage(languageId: string) {
    sessionStorage.setItem(this.IMAGE_SOURCE_LANGUAGE_KEY, languageId);
    this.imageSourceLanguageSubject.next(languageId);
  }

  setImageTargetLanguage(languageId: string) {
    sessionStorage.setItem(this.IMAGE_TARGET_LANGUAGE_KEY, languageId);
    this.imageTargetLanguageSubject.next(languageId);
  }

  getImageSourceLanguage() {
    return this.imageSourceLanguageSubject.asObservable();
  }

  getImageTargetLanguage() {
    return this.imageTargetLanguageSubject.asObservable();
  }

  clearLanguages() {
    // Clear text service languages
    sessionStorage.removeItem(this.TEXT_SOURCE_LANGUAGE_KEY);
    sessionStorage.removeItem(this.TEXT_TARGET_LANGUAGE_KEY);
    this.textSourceLanguageSubject.next('');
    this.textTargetLanguageSubject.next('');
    
    // Clear doc service languages
    sessionStorage.removeItem(this.DOC_SOURCE_LANGUAGE_KEY);
    sessionStorage.removeItem(this.DOC_TARGET_LANGUAGE_KEY);
    this.docSourceLanguageSubject.next('');
    this.docTargetLanguageSubject.next('');
    
    // Clear image service languages
    sessionStorage.removeItem(this.IMAGE_SOURCE_LANGUAGE_KEY);
    sessionStorage.removeItem(this.IMAGE_TARGET_LANGUAGE_KEY);
    this.imageSourceLanguageSubject.next('');
    this.imageTargetLanguageSubject.next('');
  }
} 