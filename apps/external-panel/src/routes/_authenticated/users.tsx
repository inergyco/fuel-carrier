import { createFileRoute } from "@tanstack/react-router";
import { useI18nContext } from "@fuel-carrier/i18n/react";
import { CompanyUserFormModal } from "../../components/users/CompanyUserFormModal";
import { DeleteCompanyUserModal } from "../../components/users/DeleteCompanyUserModal";
import { ResourceSection } from "../../components/users/ResourceSection";
import { getUserColumns } from "../../components/users/userColumns";
import { useCompanyUsers } from "../../components/users/useCompanyUsers";

export const Route = createFileRoute("/_authenticated/users")({
  component: CompanyUsersPage,
});

function CompanyUsersPage() {
  const { LL } = useI18nContext();
  const users = useCompanyUsers();
  const emptyCell = LL.externalPanel.users.emptyCell();

  return (
    <div className="mx-auto max-w-5xl">
      <ResourceSection
        title={LL.externalPanel.users.title()}
        subtitle={LL.externalPanel.users.subtitle()}
        addLabel={LL.externalPanel.users.addUser()}
        emptyLabel={LL.externalPanel.users.empty()}
        loading={users.usersQuery.isLoading}
        items={users.usersQuery.data ?? []}
        columns={getUserColumns({ LL, emptyCell })}
        actionLabels={{
          loading: LL.externalPanel.users.loading(),
          edit: LL.externalPanel.users.edit(),
          delete: LL.externalPanel.users.delete(),
          operations: LL.externalPanel.users.operations(),
        }}
        onAdd={function openCreateUser() {
          users.setUserModal({ mode: "create" });
        }}
        onEdit={function openEditUser(user) {
          users.setUserModal({ mode: "edit", item: user });
        }}
        onDelete={users.setDeleteTarget}
      />

      {users.userModal && (
        <CompanyUserFormModal
          key={
            users.userModal.mode === "edit"
              ? `user-edit-${users.userModal.item.id}`
              : "user-create"
          }
          mode={users.userModal.mode}
          user={
            users.userModal.mode === "edit" ? users.userModal.item : undefined
          }
          onClose={function closeUserModal() {
            users.setUserModal(null);
          }}
          onSuccess={users.handleChanged}
        />
      )}

      <DeleteCompanyUserModal
        target={users.deleteTarget}
        mutation={users.deleteMutation}
        onClose={function closeDeleteModal() {
          users.setDeleteTarget(null);
        }}
      />
    </div>
  );
}
