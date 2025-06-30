// Helper functions for CustomFieldsRenderer
export const CustomFieldsHelpers = {
  fixCheckboxValues(renderer, field) {
    const selectors = [
      `input[type="checkbox"][name="${field.name}[]"]:checked`,
      `input[type="checkbox"][name="${field.name}"]:checked`,
      `input[name="${field.name}[]"]:checked`,
      `input[name="${field.name}"]:checked`
    ];

    let $checkboxes = $();
    selectors.forEach((selector) => {
      const found = renderer.$element.find(selector);
      if (found.length > 0) {
        $checkboxes = found;
      }
    });

    const checkedValues = [];
    $checkboxes.each((index, element) => {
      const $checkbox = $(element);
      let value = $checkbox.val();

      if (!value || value === "on") {
        value = this.extractLabelValue($checkbox, field, checkedValues.length);
      }

      if (value && value !== "on") {
        checkedValues.push(value);
      }
    });

    if (checkedValues.length > 0) {
      field.userData = checkedValues;
    }
  },

  fixRadioValues(renderer, field) {
    const $checkedRadio = renderer.$element.find(`input[type="radio"][name="${field.name}"]:checked`);

    if ($checkedRadio.length > 0) {
      let value = $checkedRadio.val();

      if (!value || value === "on") {
        const labelText = $checkedRadio.closest("label").text().trim() ||
          $checkedRadio.siblings("label").text().trim();

        if (field.values && field.values.length > 0) {
          const matchingOption = field.values.find((option) =>
            option.label === labelText ||
            labelText.includes(option.label)
          );
          value = matchingOption
            ? (matchingOption.value || matchingOption.label)
            : labelText;
        } else {
          value = labelText || "radio-selected";
        }
      }

      if (value && value !== "on") {
        field.userData = [value];
      }
    }
  },

  fixSelectValues(renderer, field) {
    const $select = renderer.$element.find(`select[name="${field.name}"]`);

    if ($select.length > 0) {
      let selectedValue = $select.val();

      if (!selectedValue || selectedValue === "on") {
        const selectedText = $select.find("option:selected").text().trim();
        selectedValue = selectedText || "select-option";
      }

      if (selectedValue && selectedValue !== "on") {
        field.userData = [selectedValue];
      }
    }
  },

  extractLabelValue($checkbox, field, index) {
    const labelText = $checkbox.closest("label").text().trim() ||
      $checkbox.siblings("label").text().trim() ||
      $checkbox.parent().text().trim();

    if (field.values && field.values.length > 0) {
      const matchingOption = field.values.find((option) =>
        option.label === labelText ||
        labelText.includes(option.label) ||
        option.label.includes(labelText)
      );

      if (matchingOption) {
        return matchingOption.value || matchingOption.label || `option-${field.values.indexOf(matchingOption) + 1}`;
      }
      return labelText || `checkbox-${index + 1}`;
    }
    return labelText || `checkbox-${index + 1}`;
  }
};
