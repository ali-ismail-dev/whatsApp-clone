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

export default function EditContactNameModal({ show = false, onClose = () => {}, conversation }) {
  const { emit } = useEventBus();

  const { data, setData, reset } = useForm({
    name: conversation?.name || "",
  });

  const [errors, setErrors] = useState({});

  const closeModal = () => {
    reset();
    setErrors({});
    onClose();
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!data.name?.trim()) {
      emit("toast.show", { message: "Name is required", type: "error" });
      return;
    }

    try {
      // Find the contact record ID
      // We need to get the contact record, not just the user ID
      const response = await axios.put(
    route("contacts.update", conversation.contact_record_id),
    { name: data.name }

      );

      emit("toast.show", { 
        message: response.data.message || "Contact name updated", 
        type: "success" 
      });

      // Emit event so the sidebar updates
      emit("contact.name.updated", {
        userId: conversation.id,
        newName: data.name
      });

      setTimeout(() => closeModal(), 120);
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        const body = err.response.data || {};

        if (status === 422) {
          const serverErrors = body.errors || {};
          const flattened = Object.keys(serverErrors).reduce((acc, key) => {
            const val = serverErrors[key];
            acc[key] = Array.isArray(val) ? val[0] : val;
            return acc;
          }, {});
          setErrors(flattened);
          emit("toast.show", { message: "Update failed", type: "error" });
          return;
        }

        const msg = body.message || "Update failed";
        emit("toast.show", { message: msg, type: "error" });
        return;
      }

      console.error("Contact name update failed", err);
      emit("toast.show", { message: "Update failed", type: "error" });
    }
  };

  return (
    <Modal show={show} onClose={closeModal}>
      <form onSubmit={submit} className="p-6 overflow-y-auto">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Edit Contact Name
        </h2>

        <p className="text-sm text-gray-500 mt-2">
          Change how this contact appears in your chat list.
        </p>

        <div className="mt-6">
          <InputLabel htmlFor="name" value="Display Name" />
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

        <div className="mt-6 flex justify-end">
          <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
          <PrimaryButton className="ml-3" type="submit">
            Update Name
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}