// resources/js/Components/App/NewContactModal.jsx
import { useForm } from "@inertiajs/react";
import InputError from "../InputError";
import InputLabel from "../InputLabel";
import TextInput from "../TextInput";
import { useEventBus } from "@/EventBus";
import Modal from "../../../../vendor/laravel/breeze/stubs/inertia-react/resources/js/Components/Modal.jsx";
import SecondaryButton from "../SecondaryButton";
import PrimaryButton from "../PrimaryButton";

export default function NewContactModal({ show = false, onClose = () => {} }) {
  const { emit } = useEventBus();

  const { data, setData, post, processing, errors, reset } = useForm({
    name: "",
    email: "",
  });

  // Helper to close modal and reset form
  const closeModal = () => {
    reset();
    onClose();
  };

  // Submit: send contact request
  const submit = (e) => {
    e.preventDefault();

    // small client guard
    if (!data.name?.trim() || !data.email?.trim()) {
      emit("toast.show", "Please provide both name and email.");
      return;
    }

    post(route("contacts.store"), {
      onSuccess: (page) => {
        emit("toast.show", `Contact request sent to ${data.email}`);
        // helpful event so other parts can update (notification bell, sidebar)
        emit("contact.request.sent", { email: data.email, name: data.name });
        closeModal();
      },
      onError: (err) => {
        // errors will be shown by InputError components
        console.error("Contact request failed", err);
      },
    });
  };

  return (
    <Modal show={show} onClose={closeModal}>
      <form onSubmit={submit} className="p-6 overflow-y-auto">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Add Contact
        </h2>

        <p className="text-sm text-gray-500 mt-2">
          Provide a display name (this will be how you see the contact) and the email of the user on the platform.
        </p>

        <div className="mt-6">
          <InputLabel htmlFor="name" value="Display name" />
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
            required
          />
          <InputError message={errors.email} className="mt-2" />
        </div>

        <div className="mt-6 flex justify-end">
          <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
          <PrimaryButton className="ml-3" disabled={processing}>
            Send Request
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
