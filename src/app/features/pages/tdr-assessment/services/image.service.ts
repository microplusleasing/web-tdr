import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  createMockImageFile(fileName: string, color: string): File {
    const canvas = document.createElement('canvas');

    canvas.width = 800;
    canvas.height = 600;

    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Cannot create canvas context');
    }

    // Background
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Text
    context.fillStyle = '#ffffff';
    context.font = 'bold 48px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    context.fillText(fileName, canvas.width / 2, canvas.height / 2);

    const dataUrl = canvas.toDataURL('image/jpeg');

    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];

    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([uint8Array], {
      type: mimeString,
    });

    return new File([blob], fileName, {
      type: 'image/jpeg',
    });
  }
}
