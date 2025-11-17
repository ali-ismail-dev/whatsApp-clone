// resources/js/Components/App/NewContactModal.jsx
import { useForm } from "@inertiajs/react";
import InputError from "../InputError";
import InputLabel from "../InputLabel";
import TextInput from "../TextInput";
import { useEventBus } from "@/EventBus";
import Modal from "@/Components/Modal";
import SecondaryButton from "../SecondaryButton";
import PrimaryButton from "../PrimaryButton";
import axios from "axios";
import { useState } from "react";

export default function NewContactModal({ show = false, onClose = () => {} }) {
  const { emit } = useEventBus();

  // Keep useForm for convenient data binding and reset
  const { data, setData, reset } = useForm({
    name: "",
    email: "",
  });

  // local errors (so we can show field errors when using axios)
  const [errors, setErrors] = useState({});

  // Helper to close modal and reset form
  const closeModal = () => {
    reset();
    setErrors({});
    onClose();
  };

  // Submit: use axios so we can read JSON body and status codes directly
  const submit = async (e) => {
    e.preventDefault();

    // client guard
    if (!data.name?.trim() || !data.email?.trim()) {
      emit("toast.show", { message: "Name and email are required", type: "error" });
      return;
    }

    // show a transient UI clue that request is being sent
    emit("toast.show", { message: "Sending request...", type: "info", loading: true });

    try {
      const response = await axios.post(route("contacts.store"), {
        name: data.name,
        email: data.email,
      });

      // Successful HTTP response (200, maybe used for info/success messages)
      const msg = response?.data?.message || "Done";

      // Decide toast type — treat "already" / "pending" text as info
      const lower = String(msg).toLowerCase();
      const type = lower.includes("already") || lower.includes("pending") ? "info" : "success";

      emit("toast.show", { message: msg, type });

      // Notify other UI pieces (sidebar, notifications) that request was sent
      emit("contact.request.sent", { email: data.email, name: data.name });

      // Close modal after a short delay so toast has time to register
      setTimeout(() => closeModal(), 120);
    } catch (err) {
      // Axios errors: handle validation (422) and other statuses
      if (err.response) {
        const status = err.response.status;
        const body = err.response.data || {};

        if (status === 422) {
          // Validation errors: body.errors is expected
          const serverErrors = body.errors || {};
          // Flatten to first message per field for InputError
          const flattened = Object.keys(serverErrors).reduce((acc, key) => {
            const val = serverErrors[key];
            acc[key] = Array.isArray(val) ? val[0] : val;
            return acc;
          }, {});
          setErrors(flattened);

          // Show a short toast as well
          emit("toast.show", { message: "Request failed", type: "error" });
          return;
        }

        // Known application message (e.g., 404 user not found, 409 conflict)
        const msg = body.message || "Request failed";
        const t = status >= 500 ? "error" : (status === 404 ? "error" : (status === 409 ? "info" : "info"));
        emit("toast.show", { message: msg, type: t });
        return;
      }

      // Network / unknown error
      console.error("Contact request failed", err);
      emit("toast.show", { message: "Request failed", type: "error" });
    }
  };

  return (
    <Modal show={show} onClose={closeModal}>
      <form onSubmit={submit} className="p-6 overflow-y-auto">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Add Contact</h2>

        <p className="text-sm text-gray-500 mt-2">
          Provide a display name (how you want to see the contact) and the email of the user on the platform.
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
            onChange={(e) => {
              setData("name", e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
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
            onChange={(e) => {
              setData("email", e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            required
          />
          <InputError message={errors.email} className="mt-2" />
        </div>

        <div className="mt-6 flex justify-end">
          <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
          <PrimaryButton className="ml-3" type="submit">
            Send Request
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
