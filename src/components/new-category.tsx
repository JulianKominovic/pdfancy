import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";
import { Link } from "@heroui/link";
import { Hash, Text } from "lucide-react";
import { Button } from "@heroui/button";

import useDrawersStore from "@/stores/drawers";
import sqlite from "@/storage/sqlite";

export default function NewCategory() {
  const isOpen = useDrawersStore((s) => s.showNewCategoryDrawer);
  const onOpenChange = useDrawersStore((s) => s.setShowNewCategoryDrawer);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent as={"form"}>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              New category
            </ModalHeader>
            <ModalBody>
              <Input
                endContent={
                  <Hash className="flex-shrink-0 text-2xl pointer-events-none text-default-400" />
                }
                label="Name"
                placeholder="Enter the name for this category"
                variant="bordered"
              />
              <Input
                endContent={
                  <Text className="flex-shrink-0 text-2xl pointer-events-none text-default-400" />
                }
                label="Description"
                placeholder="Enter your password"
                type="password"
                variant="bordered"
              />
              <div className="flex justify-between px-1 py-2">
                <Checkbox
                  classNames={{
                    label: "text-small",
                  }}
                >
                  Remember me
                </Checkbox>
                <Link color="primary" href="#" size="sm">
                  Forgot password?
                </Link>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose}>
                Close
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  sqlite.run("SELECT * FROM category");
                }}
              >
                Sign in
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
