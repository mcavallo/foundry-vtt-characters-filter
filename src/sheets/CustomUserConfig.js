import fuzzysort from 'fuzzysort';
import { MODULE } from '../constants';
import { debounce } from '../lib/utils';

export class CustomUserConfig extends UserConfig {
  constructor(object, options = {}) {
    super(object, options);
    this._filterValue = '';
    this._filterCursorPosition = 0;
    this._filterWasFocused = false;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['sheet', 'user-config'],
      template: `modules/${MODULE.ID}/templates/user-config.html`,
      width: 500,
      height: 'auto',
    });
  }

  _persistCursorPosition = ev => {
    const value = ev.target.value;
    this._filterCursorPosition = value.slice(0, ev.target.selectionStart).length;
  };

  _persistValue = ev => {
    this._filterValue = ev.target.value.toLowerCase().trim();
  };

  _handleFilterInputChange = ev => {
    this._persistCursorPosition(ev);
    this._persistValue(ev);
    this.render(false);
  };

  getData(options = {}) {
    const data = super.getData(options);
    const totalActors = data.actors.length;
    const filterIsVisible = totalActors > 7;
    const filterIsEnabled = this._filterValue && filterIsVisible;

    // If there is a character selected disable the filter
    if (data.user.character) {
      this._filterValue = '';
      this._filterCursorPosition = 0;
      this._filterWasFocused = false;
      data.filterValue = this._filterValue;
      data.filterIsVisible = false;
      data.filterHasNoResults = false;
      return data;
    }

    // If the filter is enabled then perform the fuzzy filter and pick the relevant actors
    if (filterIsEnabled) {
      const results = fuzzysort.go(this._filterValue, data.actors, {
        key: 'name',
        threshold: 0.5,
      });

      data.actors = results.map(result => result.obj);
    }

    data.filterValue = this._filterValue;
    data.filterIsVisible = filterIsVisible;
    data.filterHasNoResults = filterIsEnabled && !data.actors.length;
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    let filterInput = html.find('#character-filter-input');

    // Do nothing if the input field is not present
    if (!filterInput.length) {
      return;
    }

    // If the filter value is set then focus the input and move the cursor to the end
    if (this._filterValue || this._filterWasFocused) {
      filterInput.focus();
      filterInput[0].setSelectionRange(
        this._filterCursorPosition,
        this._filterCursorPosition
      );
    }

    // Bind the debounced change event
    filterInput.bind('change paste keyup', ev => {
      if (this._filterValue !== ev.target.value) {
        debounce(this._handleFilterInputChange, 500)(ev);
      }
    });

    // Keep track of the focus state between renders
    filterInput.bind('focus blur', ev => {
      this._filterWasFocused = ev.type === 'focus';
    });
  }
}
