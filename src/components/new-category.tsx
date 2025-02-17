// import {
//   Drawer,
//   DrawerContent,
//   DrawerHeader,
//   DrawerBody,
//   DrawerFooter,
// } from "@heroui/drawer";
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
import { MailIcon, LockIcon, Hash, Text } from "lucide-react";
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
                  <Hash className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                }
                label="Name"
                placeholder="Enter the name for this category"
                variant="bordered"
              />
              <Input
                endContent={
                  <Text className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                }
                label="Description"
                placeholder="Enter your password"
                type="password"
                variant="bordered"
              />
              <div className="flex py-2 px-1 justify-between">
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
