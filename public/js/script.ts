import "@Styles/style.css";

import { AdbDeviceController } from "@Controller/AdbDeviceController";
import { MacroController } from "@Controller/MacroController";
import { ProfileController } from "@Controller/ProfileController";
import "@fortawesome/fontawesome-free";
import "bootstrap";

// Pass reference of profileController to AdbDeviceController
// Needed to know which profile is currently active
AdbDeviceController.getInstance().setProfileControllerInstance(ProfileController.getInstance());
MacroController.getInstance();
