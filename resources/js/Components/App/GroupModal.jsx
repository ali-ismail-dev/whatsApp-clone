import { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import InputError from "../InputError";
import InputLabel from "../InputLabel";
import TextInput from "../TextInput";
import { useEventBus } from "@/EventBus";
import Modal from "../../../../vendor/laravel/breeze/stubs/inertia-react/resources/js/Components/Modal.jsx";
import SecondaryButton from "../SecondaryButton";
import PrimaryButton from "../PrimaryButton";
import { usePage, router } from "@inertiajs/react";
import UserPicker from "./UserPicker";

export default function GroupModal({ show = false, onClose = () => {} }) {
  const page = usePage();
  const conversations = page.props.conversations || [];
  const { on, emit } = useEventBus();

  const { data, setData, post, put, processing, errors, reset } = useForm({
    id: "",
    name: "",
    description: "",
    users_ids: [],
  });

  const [group, setGroup] = useState({});

  // Derive users list (only users, not groups)
  const users = Array.isArray(conversations) ? conversations.filter((c) => !c.is_group) : [];

  // Helper to close modal and reset form
  const closeModal = () => {
    reset();
    setGroup({});
    onClose();
  };

  // Listen for the event that opens the modal (for create OR edit)
  useEffect(() => {
    const off = on("GroupModal.show", (g) => {
      console.log("🧪 GroupModal.show payload:", g);

      if (!g) {
        // open empty create form
        setGroup({});
        setData({
          id: "",
          name: "",
          description: "",
          users_ids: [],
        });
        return;
      }

      // populate form for editing
      setGroup(g || {});

      // Prefer using user_ids (array of IDs) if provided by backend
      const initialUserIds = Array.isArray(g.user_ids) && g.user_ids.length
        ? g.user_ids
        : (Array.isArray(g.users) ? g.users.map(u => u.id) : []);

      // Exclude owner_id (backend expects owner to be added automatically on sync)
      const usersIdsExcludingOwner = initialUserIds.filter(id => id !== g.owner_id);

      setData({
        id: g.id || "",
        name: g.name || "",
        description: g.description || "",
        users_ids: usersIdsExcludingOwner,
      });
    });

    return () => off();
  }, [on, setData]);

  // Create or update group handler (top-level)
  const createOrUpdateGroup = (e) => {
    e.preventDefault();
    console.log("🧪 Submitting group data:", data);

    if (data.id) {
      // update (uses put)
      put(route("group.update", data.id), {
        onSuccess: () => {
          // Build an optimistic updated conversation object to update sidebar/client state
          const updatedConversation = {
            id: data.id,
            is_group: true,
            name: data.name,
            description: data.description,
            owner_id: group.owner_id ?? null,
            users: users.filter((u) => (data.users_ids || []).includes(u.id)),
            user_ids: data.users_ids || [],
            last_message: group.last_message ?? null,
            is_user: false,
            is_online: null,
          };

          // Emit updated event so layouts can update their local state
          emit("group.updated", updatedConversation);

          emit("toast.show", `Group ${data.name} updated successfully`);
          closeModal();

          // If the user is currently viewing this group's page, do a lightweight replace
          // to fetch the fresh selectedConversation props for the chat view.
          try {
            const path = window.location.pathname || "";
            if (path.includes(`/group/${data.id}`)) {
              // replace current route (lightweight navigation) to refresh selectedConversation
              router.visit(route("chat.group", data.id), { replace: true });
            }
          } catch (e) {
            // ignore navigation errors
            console.error("replace navigation failed", e);
          }
        },
        onError: (err) => {
          console.error("Update error:", err);
        },
      });
    } else {
      // create (uses post)
      post(route("group.store"), {
        onSuccess: (page) => {
          emit("toast.show", `Group ${data.name} created successfully`);
          closeModal();

          // After creating, navigate to dashboard or update UI — we just reload sidebar via event
          const createdConversation = {
            id: page.props?.conversation?.id ?? null,
            is_group: true,
            name: data.name,
            description: data.description,
            owner_id: page.props?.auth?.user?.id ?? null,
            users: users.filter((u) => (data.users_ids || []).includes(u.id)),
            user_ids: data.users_ids || [],
            last_message: null,
            is_user: false,
            is_online: null,
          };
          emit("group.created", createdConversation);
        },
        onError: (err) => {
          console.error("Create error:", err);
        },
      });
    }
  };

  // Handler passed to UserPicker
  const handleUserPickerSelect = (selected) => {
    if (Array.isArray(selected)) {
      setData("users_ids", selected.map((u) => u.id));
      console.log("🧪 UserPicker selected (array):", selected.map((u) => u.id));
    } else if (selected && selected.id) {
      setData("users_ids", [selected.id]);
      console.log("🧪 UserPicker selected (single):", selected.id);
    } else {
      setData("users_ids", []);
      console.log("🧪 UserPicker selected: empty");
    }
  };

  // Resolve currently selected user objects for the picker (so it can show selected items)
  const selectedUserObjects = users.filter((u) => (data.users_ids || []).includes(u.id) && u.id !== group.owner_id);

  return (
    <Modal show={show} onClose={closeModal}>
      <form onSubmit={createOrUpdateGroup} className="p-6 overflow-y-auto">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {group.id ? "Update Group" : "Create Group"}
        </h2>

        <div className="mt-6">
          <InputLabel htmlFor="name" value="Name" />
          <TextInput
            id="name"
            type="text"
            name="name"
            value={data.name}
            disabled={!!group.id}
            required
            className="mt-1 block w-full"
            autoComplete="name"
            isFocused
            onChange={(e) => setData("name", e.target.value)}
          />
          <InputError message={errors.name} className="mt-2" />
        </div>

        <div className="mt-6">
          <InputLabel htmlFor="description" value="Description" />
          <TextInput
            id="description"
            type="text"
            name="description"
            value={data.description || ""}
            className="mt-1 block w-full"
            autoComplete="description"
            onChange={(e) => setData("description", e.target.value)}
          />
          <InputError message={errors.description} className="mt-2" />
        </div>

        <div className="mt-6">
          <InputLabel htmlFor="users_ids" value="Users" />
          <UserPicker
            value={users.filter((u) => (data.users_ids || []).includes(u.id))}
            options={users}
            onSelect={handleUserPickerSelect}
          />
          <InputError message={errors.users_ids} className="mt-2" />
        </div>

        <div className="mt-6 flex justify-end">
          <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
          <PrimaryButton className="ml-3" disabled={processing}>
            {group.id ? "Update" : "Create"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
