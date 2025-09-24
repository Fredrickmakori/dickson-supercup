// Lightweight Firebase scaffold with graceful fallback to localStorage.
// Uses dynamic imports so the app can run without the Firebase SDK installed.

export async function uploadFile(file, destPath = 'ids'){
  // destPath is informational; when falling back we store in localStorage under dsc_ids
  if(!file) throw new Error('No file');

  // try modular Firebase SDK upload if available
  try{
    const { initializeApp } = await import('firebase/app');
    const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');

    // NOTE: caller must initialize firebase elsewhere with their config.
    const storage = getStorage();
    const fileRef = ref(storage, `${destPath}/${Date.now()}_${file.name}`);
    // uploadBytes accepts a Blob
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    return { url, provider: 'firebase' };
  }catch(err){
    // fallback: store as data URL in localStorage
    try{
      const dataUrl = await readFileAsDataURL(file);
      const store = JSON.parse(localStorage.getItem('dsc_ids') || '{}');
      const id = `id_${Date.now()}`;
      store[id] = { name: file.name, dataUrl, created: Date.now(), path: `${destPath}/${file.name}` };
      localStorage.setItem('dsc_ids', JSON.stringify(store));
      // return a pseudo-url using the data url so it can be rendered directly
      return { url: dataUrl, provider: 'local' };
    }catch(e){
      throw e;
    }
  }
}

export function readFileAsDataURL(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onload = ()=> resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Note: we avoid synchronous require.resolve checks here because some bundlers
// do not allow resolving package paths at runtime. The uploadFile function uses
// dynamic imports and will gracefully fall back to localStorage when the
// Firebase SDK isn't installed.
