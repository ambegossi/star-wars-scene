import { BasicApp } from './app/basic-app';
import './styles/scss/main.scss';
import { StarWarsFPS } from './app/star-wars-fps';
import { StarWarsTPS } from './app/star-wars-tps';

const canvas = document.querySelector<HTMLCanvasElement>('.main__canvas');

let currentApp: BasicApp = new StarWarsFPS(canvas);
currentApp.run();

document.getElementById('demo-picker').addEventListener('change', async d => {
    const selection: string = (<HTMLSelectElement>d.target).value;

    if (selection.localeCompare('star-wars-fps') === 0) {
        await currentApp.stop();
        currentApp = new StarWarsFPS(canvas);
        currentApp.run();
        return;
    }

    if (selection.localeCompare('star-wars-tps') === 0) {
        await currentApp.stop();
        currentApp = new StarWarsTPS(canvas);
        currentApp.run();
        return;
    }
});