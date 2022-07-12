const { execSync } = require("child_process");
const { Socket } = require("net");
const log = require("electron-log");

const zeroPad = (num, places) => String(num).padStart(places, "0");

class AdbDeviceTracker {
  /**
   * @param {?number} port Optional The port of the adb socket. Default: 5037
   * @param {?string} host Optional The ip address of the adb server host. Default: 127.0.0.1
   * @returns {AdbDeviceTracker} AdbDeviceTracker object
   */
  constructor() {
    this.attachedAdbDevices = [];
    this.port = 5037;
    this.host = "127.0.0.1";
    this.socket = new Socket();

    // add binding to functions to honor scope of class
    this.setMainWindowRef = this.setMainWindowRef.bind(this);
    this.getRunningAdbPath = this.getRunningAdbPath.bind(this);
    this.connect = this.connect.bind(this);
    this.onConnect = this.onConnect.bind(this);
    this.onData = this.onData.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onError = this.onError.bind(this);

    // register socket listeners
    this.socket.on("connect", this.onConnect);
    this.socket.on("data", this.onData);
    this.socket.on("close", this.onClose);
    this.socket.on("error", this.onError);
  }

  setMainWindowRef(windowRef) {
    this.mainWindowRef = windowRef;
  }

  getRunningAdbPath() {
    this.runningAdbPath = execSync(
      `powershell "(Get-Process adb -ErrorAction SilentlyContinue).Path"`.normalize()
    )
      .toString()
      .trim()
      .replace("\\adb.exe", "");

    if (this.runningAdbPath === "") {
      log.error(
        "[AdbDeviceTracker]",
        "No running adb process found. Using bundled adb-micro resource."
      );
      return "";
    }

    log.info(
      "[AdbDeviceTracker]",
      "Found adb in directory:",
      this.runningAdbPath
    );
    return this.runningAdbPath;
  }

  connect() {
    this.socket.connect({
      port: this.port,
      host: this.host,
    });
  }

  onConnect() {
    log.info(
      "[AdbDeviceTracker]",
      "connected to socket",
      `${this.host}:${this.port}`
    );
    const payload = `host:track-devices-l`;
    const payloadLength = zeroPad(payload.length.toString(16), 4);
    this.socket.write(`${payloadLength}${payload}`);
  }

  onData(data) {
    this.attachedAdbDevices = [];

    const deviceLength = data.toString().replace("OKAY", "").slice(0, 4);

    // Remove the first 4 characters as they represent the data length
    const deviceString = data
      .toString()
      .replace("OKAY", "")
      .slice(4)
      .replace(/\s\s+/g, " ");

    // devices get registered as offline for the first time
    // no information about the device is available at this point
    // so we do not process this event
    if (deviceString.match("offline")) return;

    // if no devices are connected add dummy device
    // delete dummy device once the deviceString is not empty = device(s) connected
    if (deviceLength.match("0000")) {
      this.attachedAdbDevices.push({ error: "No devices connected" });
    } else {
      const devicesArray = deviceString
        .slice(0, deviceString.lastIndexOf("\n"))
        .trim()
        .split("\n");

      log.debug("[AdbDeviceTracker]", "Found devices raw:", devicesArray);

      // eslint-disable-next-line array-callback-return
      devicesArray.forEach((d) => {
        const [androidId, deviceState, product, model, device, transportId] = d
          .replace(/transport_id:|device:|model:|product:/g, "")
          .split(/\s/g);

        this.attachedAdbDevices.push({
          androidId,
          deviceState,
          product,
          model,
          device,
          transportId,
        });
      });
      log.debug(
        "[AdbDeviceTracker]",
        "Found devices object:",
        this.attachedAdbDevices
      );
    }

    this.mainWindowRef.webContents.send(
      "adb:track-devices",
      this.attachedAdbDevices
    );
  }

  onClose() {
    setTimeout(this.connect, 1000);
  }

  onError(error) {
    let notificationBody = "";
    switch (error.code) {
      case "EISCONN":
        notificationBody = "Already connected to ADB-Socket";
        break;
      case "ECONNREFUSED":
        notificationBody =
          "Could not connect to local adb-server!\nIs the local adb-server running?";
        break;
      case "ECONNRESET":
        notificationBody = "Connection to local adb-server lost.";
        break;
      default:
        notificationBody = error.message;
        break;
    }
    this.mainWindowRef.webContents.send("adb:track-devices", {
      error: notificationBody,
    });
  }
}

module.exports = new AdbDeviceTracker();
