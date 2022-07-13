const Shell = imports.gi.Shell;
const Mainloop = imports.mainloop;
const Main = imports.ui.main;

class Extension {
    constructor() {
        this._oldSetDate = null;
        this._updateTimerId = null;
        this._handlerId = null;
    }

    enable() {
        let dateMenu = Main.panel.statusArea.dateMenu;
        this._oldSetDate = dateMenu._date.setDate; // saving the old setDate

        // overriding setDate so that it displays the time
        dateMenu._date.setDate = (date) => {
            dateMenu._date._dayLabel.set_text(date.toLocaleFormat('%A'));

            let dateFormat = Shell.util_translate_time_string(N_("%B %-d %Y %H:%M:%S"));
            dateMenu._date._dateLabel.set_text(date.toLocaleFormat(dateFormat));

            dateFormat = Shell.util_translate_time_string(N_("%A %B %e %Y %H:%M:%S"));
            dateMenu._date.accessible_name = date.toLocaleFormat(dateFormat);
        };

        // constant updating of the date after opening the menu
        this._handlerId = dateMenu.menu.connect('open-state-changed', (_, isOpen) => {
            if (isOpen) {
                this._updateTimerId = Mainloop.timeout_add(100, () => {
                    dateMenu._date.setDate(new Date());
                    return true;
                });
            } else {
                Mainloop.source_remove(this._updateTimerId);
                this._updateTimerId = null;
            }
        });
    }

    disable() {
        let dateMenu = Main.panel.statusArea.dateMenu;

        // disabling the update timer
        Mainloop.source_remove(this._updateTimerId);
        this._updateTimerId = null;

        // disabling the handler
        dateMenu.menu.disconnect(this._handlerId);
        this._handlerId = null;

        // setting old setDate back
        dateMenu._date.setDate = this._oldSetDate;
        this._oldSetDate = null;
    }
}

function init() {
    return new Extension();
}
