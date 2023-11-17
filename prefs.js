import Gtk from 'gi://Gtk';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';

import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class TidmExtensionPreferences extends ExtensionPreferences {
    getPreferencesWidget() {
        const settings = this.getSettings();
        const prefs = new Gtk.Grid({ row_spacing: 10 });

        const secondsHbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });

        const secondsLabel = new Gtk.Label({
            label: 'Display Seconds',
            hexpand: true,
            halign: Gtk.Align.START
        });
        const secondsToggle = new Gtk.Switch({
            active: settings.get_boolean('seconds'),
            valign: Gtk.Align.CENTER
        });
        settings.bind('seconds', secondsToggle, 'active', Gio.SettingsBindFlags.DEFAULT);

        const hfHbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });

        const hfLabel = new Gtk.Label({
            label: 'Hour Format',
            hexpand: true,
            halign: Gtk.Align.START
        });
        const hfModel = new Gtk.ListStore();
        hfModel.set_column_types([GObject.TYPE_STRING]);
        hfModel.set(hfModel.append(), [0], ['12-hour']);
        hfModel.set(hfModel.append(), [0], ['24-hour']);
        const hfComboBox = new Gtk.ComboBox({
            active: settings.get_int('hour-format'),
            model: hfModel
        });
        settings.bind('hour-format', hfComboBox, 'active', Gio.SettingsBindFlags.DEFAULT);
        const renderer = new Gtk.CellRendererText();
        hfComboBox.pack_start(renderer, true);
        hfComboBox.add_attribute(renderer, 'text', 0);

        if (Gtk.get_major_version() < 4) {
            secondsHbox.pack_start(secondsLabel, true, true, 0);
            secondsHbox.pack_end(secondsToggle, false, false, 0);

            hfHbox.pack_start(hfLabel, true, true, 0);
            hfHbox.pack_end(hfComboBox, false, false, 0);
        } else {
            secondsHbox.append(secondsLabel);
            secondsHbox.append(secondsToggle);

            hfHbox.append(hfLabel);
            hfHbox.append(hfComboBox);
        }

        prefs.attach(secondsHbox, 0, 0, 2, 1);
        prefs.attach(hfHbox, 0, 1, 2, 1);
        
        return prefs;
    }
}
