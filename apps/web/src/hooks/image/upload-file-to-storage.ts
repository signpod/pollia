export async function uploadFileToStorage(file: File, uploadUrl: string): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`업로드 실패: ${response.status} ${response.statusText}`);
  }
}
