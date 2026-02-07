# FileDropzone Integration Examples

This guide shows how to integrate the FileDropzone component into existing pages and replace old file input methods.

## Example 1: Replace Traditional File Input

### Before (Old method with hidden input)

```vue
<template>
  <div class="profile-section">
    <label class="btn btn-primary">
      Upload Photo
      <input
        type="file"
        class="d-none"
        accept="image/*"
        @change="onFileSelected"
      />
    </label>
  </div>
</template>

<script>
export default {
  methods: {
    onFileSelected(event) {
      const file = event.target.files[0]
      if (file) {
        // Upload logic here
        this.uploadPhoto(file)
      }
    }
  }
}
</script>
```

### After (Using FileDropzone)

```vue
<template>
  <div class="profile-section">
    <FileDropzone
      accept="image/*"
      label="Profile Photo"
      hint="Drag & drop or click to upload (max 5MB)"
      :max-size="5"
      @change="onPhotoSelected"
    />
  </div>
</template>

<script>
import FileDropzone from '@/components/utils/FileDropzone.vue'

export default {
  components: { FileDropzone },
  methods: {
    onPhotoSelected(files) {
      if (files.length > 0) {
        // Upload logic here - access the native File object
        this.uploadPhoto(files[0].file)
      }
    }
  }
}
</script>
```

## Example 2: Portfolio/Gallery Upload

### Integration in Contractor Onboarding

```vue
<template>
  <div class="onboarding-step">
    <h3>Portfolio Projects</h3>
    <p>Upload photos of your previous work (up to 20 images)</p>
    
    <FileDropzone
      v-model="portfolioImages"
      accept="image/jpeg,image/png,image/webp"
      :multiple="true"
      :max-files="20"
      :max-size="10"
      label="Project Photos"
      hint="JPEG, PNG, or WebP images up to 10MB each"
      @change="onPortfolioChange"
      @error="onPortfolioError"
    />
    
    <div v-if="portfolioError" class="alert alert-danger mt-3">
      {{ portfolioError }}
    </div>
    
    <button
      class="btn btn-primary mt-4"
      @click="uploadPortfolio"
      :disabled="uploading || portfolioImages.length === 0"
    >
      {{ uploading ? 'Uploading...' : 'Continue' }}
    </button>
  </div>
</template>

<script>
import { ref } from 'vue'
import FileDropzone from '@/components/utils/FileDropzone.vue'
import config from '@/config'
import { useAuthStore } from '@/stores/auth'

export default {
  components: { FileDropzone },
  setup() {
    const authStore = useAuthStore()
    const portfolioImages = ref([])
    const portfolioError = ref('')
    const uploading = ref(false)
    
    const onPortfolioChange = (files) => {
      portfolioError.value = ''
      console.log(`${files.length} images selected`)
    }
    
    const onPortfolioError = (error) => {
      portfolioError.value = error
    }
    
    const uploadPortfolio = async () => {
      uploading.value = true
      portfolioError.value = ''
      
      try {
        const token = await authStore.getAuthToken()
        const uploadedUrls = []
        
        // Upload each image
        for (const fileObj of portfolioImages.value) {
          const formData = new FormData()
          formData.append('file', fileObj.file)
          formData.append('type', 'portfolio')
          
          const response = await fetch(`${config.backend.api}/api/uploads/portfolio`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          })
          
          if (!response.ok) {
            throw new Error('Upload failed')
          }
          
          const data = await response.json()
          uploadedUrls.push(data.url)
        }
        
        // Save portfolio URLs to profile
        await savePortfolioUrls(uploadedUrls)
        
        // Navigate to next step
        router.push('/dashboard')
      } catch (error) {
        portfolioError.value = error.message || 'Upload failed'
      } finally {
        uploading.value = false
      }
    }
    
    return {
      portfolioImages,
      portfolioError,
      uploading,
      onPortfolioChange,
      onPortfolioError,
      uploadPortfolio
    }
  }
}
</script>
```

## Example 3: Document Upload in Compliance Section

```vue
<template>
  <div class="compliance-section">
    <h4>Upload Insurance Certificate</h4>
    
    <FileDropzone
      accept=".pdf,.jpg,.jpeg,.png"
      label="Insurance Certificate"
      hint="PDF or image files up to 20MB"
      :max-size="20"
      :show-preview="false"
      @change="onDocumentSelected"
    />
    
    <!-- Document Metadata Form (shown after file selected) -->
    <div v-if="selectedDocument" class="mt-4">
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Document Type</label>
          <select v-model="documentType" class="form-select">
            <option value="insurance">Insurance Certificate</option>
            <option value="bond">Bond</option>
            <option value="license">License</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label">Expiration Date</label>
          <input type="date" v-model="expirationDate" class="form-control" />
        </div>
      </div>
      
      <button
        class="btn btn-primary mt-3"
        @click="uploadDocument"
        :disabled="uploading"
      >
        {{ uploading ? 'Uploading...' : 'Upload Document' }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import FileDropzone from '@/components/utils/FileDropzone.vue'

export default {
  components: { FileDropzone },
  setup() {
    const selectedDocument = ref(null)
    const documentType = ref('insurance')
    const expirationDate = ref('')
    const uploading = ref(false)
    
    const onDocumentSelected = (files) => {
      if (files.length > 0) {
        selectedDocument.value = files[0]
      } else {
        selectedDocument.value = null
      }
    }
    
    const uploadDocument = async () => {
      // Upload implementation
    }
    
    return {
      selectedDocument,
      documentType,
      expirationDate,
      uploading,
      onDocumentSelected,
      uploadDocument
    }
  }
}
</script>
```

## Example 4: Replace DocumentUploader Component

The existing `DocumentUploader.vue` component can be enhanced with FileDropzone for better UX:

```vue
<template>
  <div class="card">
    <div class="card-header">
      <h5 class="mb-0">Upload Document</h5>
    </div>
    <div class="card-body">
      <!-- Replace the file input with FileDropzone -->
      <FileDropzone
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        label="Document"
        hint="PDF, Word, or image files up to 20MB"
        :max-size="20"
        @change="onFileSelected"
      />
      
      <!-- Rest of the form fields -->
      <div class="row g-3 mt-3">
        <div class="col-md-4">
          <label class="form-label">Document type</label>
          <select v-model="documentType" class="form-select">
            <option value="insurance">Insurance certificate</option>
            <option value="bond">Bond</option>
            <option value="license">License</option>
            <option value="certification">Certification</option>
          </select>
        </div>
        <!-- More fields... -->
      </div>
      
      <div class="mt-4">
        <WButton
          class="btn-primary"
          :loading="loading"
          @click="submit"
        >
          Upload
        </WButton>
      </div>
    </div>
  </div>
</template>
```

## Example 5: Avatar Upload with Instant Preview

```vue
<template>
  <div class="avatar-upload-section">
    <div class="row align-items-center">
      <!-- Current Avatar -->
      <div class="col-md-4 text-center">
        <div class="current-avatar mb-3">
          <img
            v-if="currentAvatar"
            :src="currentAvatar"
            alt="Avatar"
            class="rounded-circle"
            style="width: 150px; height: 150px; object-fit: cover;"
          />
          <div v-else class="avatar-placeholder">
            No avatar
          </div>
        </div>
      </div>
      
      <!-- Upload New Avatar -->
      <div class="col-md-8">
        <FileDropzone
          accept="image/*"
          :compact="true"
          label="Upload New Avatar"
          hint="Square images work best (max 5MB)"
          :max-size="5"
          @change="onAvatarSelected"
        />
      </div>
    </div>
    
    <!-- Preview and Save -->
    <div v-if="newAvatar" class="mt-4">
      <div class="card">
        <div class="card-body">
          <h6>Preview</h6>
          <img
            :src="newAvatar.preview"
            alt="Preview"
            class="rounded-circle"
            style="width: 100px; height: 100px; object-fit: cover;"
          />
          <div class="mt-3">
            <button
              class="btn btn-primary me-2"
              @click="saveAvatar"
              :disabled="uploading"
            >
              {{ uploading ? 'Saving...' : 'Save Avatar' }}
            </button>
            <button
              class="btn btn-secondary"
              @click="cancelAvatar"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import FileDropzone from '@/components/utils/FileDropzone.vue'

export default {
  components: { FileDropzone },
  setup() {
    const currentAvatar = ref('/images/default-avatar.png')
    const newAvatar = ref(null)
    const uploading = ref(false)
    
    const onAvatarSelected = (files) => {
      if (files.length > 0) {
        newAvatar.value = files[0]
      } else {
        newAvatar.value = null
      }
    }
    
    const saveAvatar = async () => {
      uploading.value = true
      // Upload logic...
      uploading.value = false
    }
    
    const cancelAvatar = () => {
      newAvatar.value = null
    }
    
    return {
      currentAvatar,
      newAvatar,
      uploading,
      onAvatarSelected,
      saveAvatar,
      cancelAvatar
    }
  }
}
</script>
```

## Best Practices

1. **Always provide clear labels and hints**: Help users understand what files are accepted
2. **Set appropriate maxSize**: Prevent users from uploading files that are too large
3. **Use specific accept patterns**: Limit file types to only what your backend can handle
4. **Handle errors gracefully**: Use the `@error` event to show user-friendly error messages
5. **Show upload progress**: Disable the dropzone during upload and show loading state
6. **Clear files after upload**: Reset the v-model or component state after successful upload
7. **Validate on backend**: Always validate file types and sizes on the backend as well
8. **Use compact mode appropriately**: For inline forms or sidebars where space is limited
9. **Consider mobile users**: The component is responsive and works well on mobile devices
10. **Provide feedback**: Use the preview feature to let users see what they're uploading

## Common Patterns

### Pattern 1: Upload on Selection

```vue
<FileDropzone
  accept="image/*"
  @change="uploadImmediately"
/>
```

### Pattern 2: Upload on Button Click

```vue
<FileDropzone
  v-model="files"
  accept="image/*"
  :multiple="true"
/>
<button @click="uploadFiles">Upload All</button>
```

### Pattern 3: Multi-step Upload with Validation

```vue
<FileDropzone
  v-model="files"
  @change="validateFiles"
  @error="handleError"
/>
<!-- Show validation results -->
<!-- Then upload button -->
```

## Migration Checklist

When replacing an old file input with FileDropzone:

- [ ] Import FileDropzone component
- [ ] Replace `<input type="file">` with `<FileDropzone>`
- [ ] Update event handler from `@change` to handle file object array
- [ ] Access native File via `fileObj.file` instead of `event.target.files[0]`
- [ ] Add appropriate props (accept, maxSize, etc.)
- [ ] Add labels and hints for better UX
- [ ] Test drag & drop functionality
- [ ] Test on mobile devices
- [ ] Verify error handling works
- [ ] Update any related documentation
