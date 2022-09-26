import "../css/style.css";

import "@fortawesome/fontawesome-free";
import "bootstrap";
import { AdbDeviceController } from "./controller/AdbDeviceController";
import { MacroController } from "./controller/MacroController";
import { ProfileController } from "./controller/ProfileController";

// Pass reference of profileController to AdbDeviceController
// Needed to know which profile is currently active
AdbDeviceController.getInstance().setProfileControllerInstance(ProfileController.getInstance());
MacroController.getInstance();
