# FileDropzone Component

A flexible, reusable drag-and-drop file upload component for Vue 3 with image preview, validation, and customization options.

## Features

- **Drag & Drop**: Visual feedback when dragging files over the dropzone
- **Click to Browse**: Traditional file input fallback
- **Image Preview**: Display thumbnails for image files with remove functionality
- **Multiple Files**: Configurable single/multiple file upload
- **File Validation**: Type restrictions, size limits, and file count limits
- **v-model Support**: Two-way data binding with parent components
- **Responsive**: Works great on desktop and mobile devices
- **Accessible**: Proper keyboard navigation and ARIA labels
- **Beautiful UI**: Follows the application's design system with smooth animations

## Installation

The component is located at `src/components/utils/FileDropzone.vue` and uses Lucide icons which are already installed in the project.

## Basic Usage

```vue
<template>
  <FileDropzone
    accept="image/*"
    label="Upload Images"
    @change="handleFiles"
  />
</template>

<script>
import FileDropzone from '@/components/utils/FileDropzone.vue'

export default {
  components: { FileDropzone },
  setup() {
    const handleFiles = (files) => {
      console.log('Files selected:', files)
      // files is an array of file objects with:
      // { id, file, preview, name, size, type }
    }
    
    return { handleFiles }
  }
}
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `accept` | String | `'*'` | File types to accept (e.g., `'image/*'`, `'.pdf,.doc'`) |
| `multiple` | Boolean | `false` | Allow multiple file selection |
| `maxSize` | Number | `10` | Maximum file size in MB |
| `maxFiles` | Number | `5` | Maximum number of files (for multiple mode) |
| `label` | String | `''` | Label text displayed above the dropzone |
| `hint` | String | `''` | Helper text displayed below the dropzone |
| `showPreview` | Boolean | `true` | Show image previews for image files |
| `compact` | Boolean | `false` | Smaller version for inline use |
| `disabled` | Boolean | `false` | Disable the dropzone |
| `modelValue` | Array | `[]` | v-model support for file list |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | Array | Emitted when files change (for v-model) |
| `change` | Array | Emitted when files are added or removed |
| `error` | String | Emitted when validation fails |
| `remove` | Object | Emitted when a file is removed |

## File Object Structure

Each file in the array has the following structure:

```javascript
{
  id: String,        // Unique identifier
  file: File,        // Native File object
  preview: String,   // Data URL for images (null for non-images)
  name: String,      // File name
  size: Number,      // File size in bytes
  type: String       // MIME type
}
```

## Usage Examples

### Single Image Upload (Profile Picture)

```vue
<FileDropzone
  accept="image/*"
  label="Profile Picture"
  hint="Upload a profile photo (max 5MB)"
  :max-size="5"
  @change="handleProfilePicture"
/>
```

### Multiple Images (Gallery)

```vue
<FileDropzone
  accept="image/*"
  :multiple="true"
  :max-files="10"
  label="Project Photos"
  hint="Upload up to 10 images for your portfolio"
  @change="handleGallery"
/>
```

### Document Upload

```vue
<FileDropzone
  accept=".pdf,.doc,.docx"
  :multiple="true"
  :max-files="5"
  :max-size="20"
  label="Documents"
  hint="PDF or Word documents only (max 20MB each)"
  :show-preview="false"
  @change="handleDocuments"
/>
```

### With v-model (Two-way Binding)

```vue
<template>
  <FileDropzone
    v-model="selectedFiles"
    accept="image/*"
    :multiple="true"
    label="Images"
  />
  
  <p>{{ selectedFiles.length }} files selected</p>
</template>

<script>
import { ref } from 'vue'
import FileDropzone from '@/components/utils/FileDropzone.vue'

export default {
  components: { FileDropzone },
  setup() {
    const selectedFiles = ref([])
    return { selectedFiles }
  }
}
</script>
```

### Compact Version

```vue
<FileDropzone
  accept="image/*"
  :compact="true"
  label="Avatar"
  @change="handleAvatar"
/>
```

### With Error Handling

```vue
<template>
  <FileDropzone
    accept="image/jpeg,image/png"
    :max-files="3"
    :max-size="2"
    label="Upload Images"
    hint="Only JPEG/PNG, max 2MB each"
    @change="handleFiles"
    @error="handleError"
  />
  
  <div v-if="errorMessage" class="alert alert-danger">
    {{ errorMessage }}
  </div>
</template>

<script>
import { ref } from 'vue'
import FileDropzone from '@/components/utils/FileDropzone.vue'

export default {
  components: { FileDropzone },
  setup() {
    const errorMessage = ref('')
    
    const handleFiles = (files) => {
      errorMessage.value = ''
      console.log('Valid files:', files)
    }
    
    const handleError = (error) => {
      errorMessage.value = error
    }
    
    return { errorMessage, handleFiles, handleError }
  }
}
</script>
```

### Disabled State

```vue
<FileDropzone
  accept="image/*"
  :disabled="true"
  label="Upload Disabled"
  hint="This upload is currently disabled"
/>
```

## Uploading Files to Server

The component handles file selection and validation, but you need to implement the upload logic. Here's an example:

```vue
<template>
  <FileDropzone
    v-model="files"
    accept="image/*"
    :multiple="true"
    label="Upload Photos"
  />
  
  <button @click="uploadFiles" :disabled="uploading || files.length === 0">
    {{ uploading ? 'Uploading...' : 'Upload Files' }}
  </button>
</template>

<script>
import { ref } from 'vue'
import FileDropzone from '@/components/utils/FileDropzone.vue'

export default {
  components: { FileDropzone },
  setup() {
    const files = ref([])
    const uploading = ref(false)
    
    const uploadFiles = async () => {
      uploading.value = true
      
      try {
        for (const fileObj of files.value) {
          const formData = new FormData()
          formData.append('file', fileObj.file)
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })
          
          if (!response.ok) {
            throw new Error('Upload failed')
          }
        }
        
        alert('Files uploaded successfully!')
        files.value = [] // Clear files after upload
      } catch (error) {
        alert('Upload failed: ' + error.message)
      } finally {
        uploading.value = false
      }
    }
    
    return { files, uploading, uploadFiles }
  }
}
</script>
```

## Validation Rules

### File Type Validation

The `accept` prop supports:
- MIME types: `'image/jpeg'`, `'application/pdf'`
- MIME type wildcards: `'image/*'`, `'video/*'`
- File extensions: `'.pdf'`, `'.doc'`, `'.docx'`
- Multiple types: `'image/jpeg,image/png,.pdf'`

### File Size Validation

- Files exceeding `maxSize` (in MB) will be rejected
- Error message will indicate which file exceeded the limit

### File Count Validation

- For single file mode (`multiple: false`), only 1 file is allowed
- For multiple file mode, up to `maxFiles` can be selected
- Error message will indicate if the limit is exceeded

## Styling

The component uses scoped styles and follows the application's design system:
- Uses CSS variables from `theme.css` for colors
- Matches Bootstrap 5 styling conventions
- Responsive grid layout for file previews
- Smooth transitions and hover effects
- Dark mode support through CSS variables

## Demo

Visit `/demo/file-dropzone` to see the component in action with various configurations and use cases.

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Drag & Drop API support required
- FileReader API for image previews

## Accessibility

- Keyboard navigation support (click dropzone, press Enter to open file picker)
- ARIA labels for screen readers
- Focus indicators
- Color contrast compliant

## Tips

1. **Image Previews**: Only generated for files with MIME type starting with `image/`
2. **Performance**: Large images are loaded as data URLs, which may consume memory for many files
3. **File Removal**: Users can remove files by clicking the X button on each preview
4. **Clear All**: When multiple files are selected, a "Clear all" button appears
5. **Add More**: When in multiple mode and not at max files, an "Add more files" button appears
6. **Validation**: Validation happens immediately when files are dropped or selected
7. **Disabled State**: When disabled, the dropzone shows a visual disabled state and prevents interaction

## Common Use Cases

- Profile picture upload
- Document management
- Image gallery creation
- Portfolio project uploads
- Certificate/license uploads
- Resume/CV uploads
- Product image uploads
- Avatar selection
- File attachment in forms
