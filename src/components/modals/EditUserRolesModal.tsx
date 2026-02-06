import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { roleService, type Role } from "../../core/http/services/roleService";

interface Props {
  open: boolean;
  userId?: number;
  onClose: () => void;
  onSuccess?: (userId: number) => Promise<void>;
}

export default function EditUserRolesModal({
  open,
  userId,
  onClose,
  onSuccess,
}: Props) {
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !userId) return;

    const loadData = async () => {
      setLoading(true);

      try {
        const [rolesResponse, userRolesResponse] = await Promise.all([
          roleService.listAllRoles(),
          roleService.listUserRoles(userId),
        ]);

        const roles = rolesResponse.data?.data ?? [];
        const userRoles = userRolesResponse.data ?? [];

        console.log({roles, rolesResponse, userRoles})

        setAllRoles(roles);
        setSelectedRoleIds((userRoles).map((r) => r.id));
      } catch (error) {
        console.error("Erro ao carregar roles do usuário", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [open, userId]);

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSave = async () => {
    if (!userId) return;

    setSaving(true);

    await roleService.setUserRoles({
      targetUserId: userId,
      rolesIds: selectedRoleIds,
    });

    setSaving(false);
    onSuccess?.(userId);
    onClose();
  };

  return (
    <Dialog open={open && !!userId} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar níveis de acesso do usuário</DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Stack alignItems="center" py={3}>
            <CircularProgress />
          </Stack>
        ) : (
          <Stack>
            {allRoles.map((role) => {
              if (role.name !== 'STUDENT') {
                return (
                <FormControlLabel
                  key={role.id}
                  control={
                    <Checkbox
                      checked={selectedRoleIds.includes(role.id)}
                      onChange={() => toggleRole(role.id)}
                    />
                  }
                  label={role.name}
                />
              )
              }
          })}
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}