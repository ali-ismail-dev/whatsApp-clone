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

          emit("toast.show", { message:  `Group ${data.name} updated successfully`, type: "success", delay: 300 });
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
          emit("toast.show", { message: `Group ${data.name} created successfully`, type: "success", delay: 300 });
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
      <div className="
        bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800
        border border-slate-700/50 rounded-2xl
        backdrop-blur-xl shadow-2xl shadow-blue-500/10
        overflow-hidden
      ">
        {/* Gradient header bar */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1 w-full"></div>
        
        <form onSubmit={createOrUpdateGroup} className="p-6 overflow-y-auto">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {group.id ? "Update Group" : "Create New Group"}
          </h2>

          <div className="mt-6">
            <InputLabel 
              htmlFor="name" 
              value="Group Name" 
              className="text-slate-200 font-medium"
            />
            <TextInput
              id="name"
              type="text"
              name="name"
              value={data.name}
              disabled={!!group.id}
              required
              className="mt-2 block w-full
                bg-slate-700/50 border-slate-600/50
                text-slate-200 placeholder-slate-400
                focus:border-blue-500 focus:ring-blue-500/20
                transition-all duration-300
                rounded-xl backdrop-blur-sm
              "
              autoComplete="name"
              isFocused
              onChange={(e) => setData("name", e.target.value)}
            />
            <InputError message={errors.name} className="mt-2" />
          </div>

          <div className="mt-6">
            <InputLabel 
              htmlFor="description" 
              value="Description" 
              className="text-slate-200 font-medium"
            />
            <TextInput
              id="description"
              type="text"
              name="description"
              value={data.description || ""}
              className="mt-2 block w-full
                bg-slate-700/50 border-slate-600/50
                text-slate-200 placeholder-slate-400
                focus:border-cyan-500 focus:ring-cyan-500/20
                transition-all duration-300
                rounded-xl backdrop-blur-sm
              "
              autoComplete="description"
              onChange={(e) => setData("description", e.target.value)}
            />
            <InputError message={errors.description} className="mt-2" />
          </div>

          <div className="mt-6">
            <InputLabel 
              htmlFor="users_ids" 
              value="Add Members" 
              className="text-slate-200 font-medium"
            />
            <div className="mt-2">
              <UserPicker
                value={users.filter((u) => (data.users_ids || []).includes(u.id))}
                options={users}
                onSelect={handleUserPickerSelect}
              />
            </div>
            <InputError message={errors.users_ids} className="mt-2" />
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <SecondaryButton 
              onClick={closeModal}
              className="
                bg-slate-700/50 border-slate-600/50
                text-slate-300 hover:bg-slate-600/50
                backdrop-blur-sm transition-all duration-300
                hover:scale-105
              "
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton 
              disabled={processing}
              className="
                bg-gradient-to-r from-blue-500 to-cyan-500
                hover:from-blue-600 hover:to-cyan-600
                text-white font-medium
                transition-all duration-300
                hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25
                disabled:opacity-50 disabled:scale-100
                backdrop-blur-sm
              "
            >
              {processing ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  {group.id ? "Updating..." : "Creating..."}
                </div>
              ) : (
                group.id ? "Update Group" : "Create Group"
              )}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </Modal>
  );
}