/* eslint-disable import/extensions */
import "../../../node_modules/@fortawesome/fontawesome-free/js/all.js";
import "../../../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
import adbDeviceController from "./controller/AdbDeviceController.js";
import profileController from "./controller/ProfileController.js";
import "./controller/MacroController.js";

// Pass reference of profileController to AdbDeviceController
// Needed to know which profile is currently active
adbDeviceController.setProfileControllerInstance(profileController);
