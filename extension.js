import Shell from 'gi://Shell';

import { panel } from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import { formatDateWithCFormatString } from 'resource:///org/gnome/shell/misc/dateUtils.js'
const Mainloop = imports.mainloop;

const dateMenu = panel.statusArea.dateMenu;


export default class TidmExtension extends Extension {
    enable() {
        this._timeFormat = ''
        this._updateTimerId = null;
        this._handlerId = null;
        this._settings = this.getSettings();

        this._updateTimeFormat();
        this._settings.connect('changed', (_, __) => {
            // updating the time formatting each time the settings are changed
            this._updateTimeFormat();
        });

        // overriding setDate to display the time
        dateMenu._date.setDate = (date) => {
            dateMenu._date._dayLabel.set_text(formatDateWithCFormatString(date, '%A'));

            const dateFormat = Shell.util_translate_time_string(N_("%B %-d %Y"));
            const timeFormat = Shell.util_translate_time_string(N_(this._timeFormat));
            dateMenu._date._dateLabel.set_text(formatDateWithCFormatString(date, dateFormat) + 
                                               ' ' + formatDateWithCFormatString(date, timeFormat));

            const dateAccessibleNameFormat = Shell.util_translate_time_string(N_("%A %B %e %Y"));
            dateMenu._date.accessible_name = formatDateWithCFormatString(date, dateAccessibleNameFormat);
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

        const seconds = this._settings.get_boolean('seconds');
        const hourFormat = this._settings.get_int('hour-format');

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
        this._settings = null;
    }
}
