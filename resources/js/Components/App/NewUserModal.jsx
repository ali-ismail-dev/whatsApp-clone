// resources/js/Components/App/NewUserModal.jsx
import { useForm, usePage } from "@inertiajs/react";
import InputError from "../InputError";
import InputLabel from "../InputLabel";
import TextInput from "../TextInput";
import { useEventBus } from "@/EventBus";
import Modal from "../../../../vendor/laravel/breeze/stubs/inertia-react/resources/js/Components/Modal.jsx";
import SecondaryButton from "../SecondaryButton";
import PrimaryButton from "../PrimaryButton";
import Checkbox from "../Checkbox";

export default function NewUserModal({ show = false, onClose = () => {} }) {
  const { emit } = useEventBus();
  const page = usePage();
  const currentUser = page.props?.auth?.user ?? {};

  const { data, setData, post, processing, errors, reset } = useForm({
    name: "",
    email: "",
    is_admin: false,
  });

  // Helper to close modal and reset form
  const closeModal = () => {
    reset();
    onClose();
  };

  // Create user handler
  const submit = (e) => {
    e.preventDefault();
    // small client guard
    if (!data.name || !data.email) {
      emit("toast.show", "Please provide name and email");
      return;
    }

    post(route("user.store"), {
      onSuccess: () => {
        emit("toast.show", `User ${data.name} created successfully`);
        closeModal();
      },
      onError: () => {
        // leave errors to show via InputError
      },
    });
  };

  return (
    <Modal show={show} onClose={closeModal}>
      <form onSubmit={submit} className="p-6 overflow-y-auto">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Create New User
        </h2>

        <div className="mt-6">
          <InputLabel htmlFor="name" value="Name" />
          <TextInput
            id="name"
            type="text"
            name="name"
            value={data.name}
            required
            className="mt-1 block w-full"
            autoComplete="name"
            isFocused
            onChange={(e) => setData("name", e.target.value)}
          />
          <InputError message={errors.name} className="mt-2" />
        </div>

        <div className="mt-6">
          <InputLabel htmlFor="email" value="Email" />
          <TextInput
            id="email"
            type="email"
            name="email"
            value={data.email}
            className="mt-1 block w-full"
            onChange={(e) => setData("email", e.target.value)}
          />
          <InputError message={errors.email} className="mt-2" />
        </div>

        {/* Show admin checkbox only for admin users (keeps ability but hides it from normal users) */}
        {currentUser?.is_admin && (
          <div className="mt-6 flex items-center">
            <Checkbox
              name="is_admin"
              checked={data.is_admin}
              onChange={(e) => setData("is_admin", e.target.checked)}
            />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              Is Admin
            </span>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
          <PrimaryButton className="ml-3" disabled={processing}>
            Create
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
