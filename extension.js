const Shell = imports.gi.Shell;
const Mainloop = imports.mainloop;
const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;

const dateMenu = Main.panel.statusArea.dateMenu;


class Extension {
    constructor() {
        this._timeFormat = ''
        this._updateTimerId = null;
        this._handlerId = null;
    }

    enable() {
        this.settings = ExtensionUtils.getSettings();

        this._updateTimeFormat();
        this.settings.connect('changed', (_, __) => {
            // updating the time formatting each time the settings are changed
            this._updateTimeFormat();
        });

        // overriding setDate to display the time
        dateMenu._date.setDate = (date) => {
            dateMenu._date._dayLabel.set_text(date.toLocaleFormat('%A'));

            let dateFormat = Shell.util_translate_time_string(N_("%B %-d %Y"));
            let timeFormat = Shell.util_translate_time_string(N_(this._timeFormat));
            dateMenu._date._dateLabel.set_text(`${date.toLocaleFormat(dateFormat)} ${date.toLocaleFormat(timeFormat)}`);

            dateFormat = Shell.util_translate_time_string(N_("%A %B %e %Y"));
            dateMenu._date.accessible_name = date.toLocaleFormat(dateFormat);
        };

        // permanent date update after opening the menu
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

    _updateTimeFormat() {
        // updates the time formatting depending on the settings

        const seconds = this.settings.get_boolean('seconds');
        const hourFormat = this.settings.get_int('hour-format');

        if (hourFormat == 0)
            this._timeFormat = '%I:%M %p';
        else
            this._timeFormat = '%H:%M';

        if (seconds)
            this._timeFormat = this._timeFormat.replace('%M', '%M:%S');
        else
            this._timeFormat = this._timeFormat.replace(':%S', '');
    }

    disable() {
        // disabling the update timer
        Mainloop.source_remove(this._updateTimerId);
        this._updateTimerId = null;

        // disabling the handler
        dateMenu.menu.disconnect(this._handlerId);
        this._handlerId = null;

        // restoring normal setDate
        dateMenu._date.setDate = (date) => {
            dateMenu._date._dayLabel.set_text(date.toLocaleFormat('%A'));

            let dateFormat = Shell.util_translate_time_string(N_("%B %-d %Y"));
            dateMenu._date._dateLabel.set_text(date.toLocaleFormat(dateFormat));

            dateFormat = Shell.util_translate_time_string(N_("%A %B %e %Y"));
            dateMenu._date.accessible_name = date.toLocaleFormat(dateFormat);
        };

        this._timeFormat = null;
        this.settings = null;
    }
}

function init() {
    return new Extension();
}
