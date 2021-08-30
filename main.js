const electron = require('electron');
const url = require('url');
const fs = require('fs');
const path = require('path');

const {app, BrowserWindow, Menu, dialog, ipcMain} = electron;

let mainWindow;
let addWindow;

// create menu template
const mainMenuTemplate = [
    {
        label: 'Archivo',
        submenu:[
            {
                label: 'Cargar Informacion',
                accelerator: process.platform == 'darwin' ? 'Command+O' :
                'Ctrl+O',
                click(){
                    mainWindow.webContents.send('item:clear');
                    loadFile();
                }
            },
            {
                label: 'Cerrar',
                accelerator: process.platform == 'darwin' ? 'Command+Q' :
                'Ctrl+Q',
                click(){
                    app.quit();
                }
            }

        ]
    }
]

// Wait for app to be ready
app.on('ready', function(){
    //Create new window
    mainWindow = new BrowserWindow({
        width:  800,
        height: 600,
        title:  'AGAPP',
        webPreferences: { 
            contextIsolation: false,
            nodeIntegration: true
           }
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    //quit app when closing
    mainWindow.on('closed', function(){
        app.quit();
    });

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert menu
    Menu.setApplicationMenu(mainMenu);
});

//if mac, add empty object to menu
if (process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

function loadFile() {
    console.log('loadFile confirmation');
    const window = BrowserWindow.getFocusedWindow();
    const options = {
        title: 'Elija archivo a cargar',
        filters: [
            { name: 'CSV', extensions: ['csv'] }
        ]
    };
  
    dialog.showOpenDialog(window, options).then
    (
        result => {
            if (!result.canceled)
            {
                let paths = result.filePaths;
                if (paths && paths.length > 0) {
                    const content = fs.readFileSync(paths[0]).toString();
                    window.webContents.send('load', content);
                }
            }
        }
    );
}

// Add developer tools item if not in prod
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu:[
            {
                label: 'Toffle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' :
                'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}