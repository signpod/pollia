import { toMutationFn } from "@/actions/common/error";
import { deleteFileByPath } from "@/actions/common/files";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toMutationFn(async (filePath: string) => deleteFileByPath({ path: filePath })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
}
