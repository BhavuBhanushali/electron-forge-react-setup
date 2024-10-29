const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
import { startStoreScp, storeScpOptions } from "dicom-dimse-native";

const scpOptions= {
  source: {
    aet: "MY_AET",
    ip: "192.168.0.1",
    port: 5678,
  },
  peers: [
    {
      aet: "TARGET_AET",
      ip: "127.0.0.1",
      port: 9999,
    },
  ],
  storagePath: "C:\\Users\\SIS\\Documents\\storage",
  writeFile: true,
  netTransferPrefer: "1.2.840.10008.1.2.4.80", // preferred network transfer syntax (accepted ts - additional to default ts)
  netTransferPropose: "1.2.840.10008.1.2.4.80", // proposed network transfer syntax (for outgoing associations - additional to default ts)
  writeTransfer: "", // write transfer syntax (storage only, recompress on the fly), keep empty (or leave out) to store ts as original
  permissive: false, // if true any AET can perform FIND,GET and STORE
  verbose: true,
  storeOnly: true, // do not provide FindSCP and MoveSCP (requires db) only StoreSCP
};

startStoreScp(scpOptions, (result) => {
  console.log("=-=-=-=---=--=-=-=-", JSON.parse(result));
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

const filename = `${app.getPath("userData")}/content.txt`;
const loadContent = () => {
  return fs.existsSync(filename) ? fs.readFileSync(filename, "utf8") : "";
};

const saveContent = (content) => {
  fs.writeFileSync(filename, content, "utf8");
};

ipcMain.on("saveContent", (e, content) => {
  saveContent(content);
});

ipcMain.handle("loadContent", (e) => {
  return loadContent();
});

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: "#263238",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
