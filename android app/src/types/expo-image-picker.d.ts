declare module 'expo-image-picker' {
  export type MediaTypeOptions = {
    All: 'All';
    Videos: 'Videos';
    Images: 'Images';
  };

  export type ImagePickerResult = {
    canceled: boolean;
    assets?: Array<{
      uri: string;
      width: number;
      height: number;
      type?: string;
      fileName?: string;
      fileSize?: number;
    }>;
  };

  export const MediaTypeOptions: MediaTypeOptions;

  export function launchImageLibraryAsync(options?: {
    mediaTypes?: MediaTypeOptions[keyof MediaTypeOptions];
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
    allowsMultipleSelection?: boolean;
    exif?: boolean;
  }): Promise<ImagePickerResult>;

  export function requestMediaLibraryPermissionsAsync(): Promise<{
    status: 'granted' | 'denied' | 'undetermined';
    granted: boolean;
    expires?: 'never';
  }>;
}
