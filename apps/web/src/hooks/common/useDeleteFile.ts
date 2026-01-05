import { deleteFile } from "@/actions/common/files";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (filePath: string) => {
      return deleteFile({ path: filePath });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
}
