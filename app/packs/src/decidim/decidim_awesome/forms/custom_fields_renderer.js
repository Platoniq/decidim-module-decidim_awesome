import "formBuilder/dist/form-render.min.js";
import "src/decidim/decidim_awesome/forms/rich_text_plugin"
import { CustomFieldsHelpers } from "src/decidim/decidim_awesome/forms/custom_fields_helpers"

export default class CustomFieldsRenderer { // eslint-disable-line no-unused-vars
  constructor() {
    this.lang = this.getLang(window.DecidimAwesome.currentLocale);
  }

  getLang(lang) {
    const langs = {
      "ar": "ar-TN",
      "ca": "ca-ES",
      "cs": "cs-CZ",
      "da": "da-DK",
      "de": "de-DE",
      "el": "el-GR",
      "en": "en-US",
      "es": "es-ES",
      "fa": "fa-IR",
      "fi": "fi-FI",
      "fr": "fr-FR",
      "he": "he-IL",
      "hu": "hu-HU",
      "it": "it-IT",
      "ja": "ja-JP",
      "my": "my-MM",
      "nb": "nb-NO",
      "nl": "nl-NL",
      "pl": "pl-PL",
      "pt": "pt-BR",
      "qz": "qz-MM",
      "ro": "ro-RO",
      "ru": "ru-RU",
      "sl": "sl-SI",
      "th": "th-TH",
      "tr": "tr-TR",
      "uk": "uk-UA",
      "vi": "vi-VN",
      "zh-TW": "zh-TW",
      "zh": "zh-CN"
    };
    if (langs[lang]) {
      return langs[lang];
    }
    if (langs[lang.substr(0, 2)]) {
      return langs[lang.substr(0, 2)];
    }
    return "en-US";
  }

  dataToXML(data) {
    const $dl = $("<dl/>");
    let $dd = null,
        $div = null,
        $dt = null,
        datum = null,
        key = null,
        label = null,
        text = null,
        val = null;
    $dl.attr("class", "decidim_awesome-custom_fields");
    $dl.attr("data-generator", "decidim_awesome");
    $dl.attr("data-version", window.DecidimAwesome.version);
    for (key in data) { // eslint-disable-line guard-for-in
      if (data[key].type === "textarea" && data[key].subtype === "richtext") {
        data[key].userData = [$(`#${data[key].name}-input`).val()];
      }
      if (data[key].userData && data[key].userData.length) {
        $dt = $("<dt/>");
        $dt.text(data[key].label);
        $dt.attr("name", data[key].name);
        $dd = $("<dd/>");
        for (val in data[key].userData) { // eslint-disable-line guard-for-in
          $div = $("<div/>");
          label = data[key].userData[val];
          text = null;
          if (data[key].values) {
            datum = data[key].values.find((obj) => obj.value === label); // eslint-disable-line no-loop-func
            if (datum) { // eslint-disable-line max-depth
              text = label;
              label = datum.label;
            }
          } else if (data[key].type === "date" && label) {
            datum = new Date(label).toLocaleDateString();
            if (datum) { // eslint-disable-line max-depth
              text = label;
              label = datum;
            }
          }
          if (data[key].type === "textarea" && data[key].subtype === "richtext") {
            $div.html(label);
          } else {
            $div.text(label);
          }
          if (text) {
            $div.attr("alt", text);
          }
          $dd.append($div);
        }
        $dd.attr("id", data[key].name);
        $dd.attr("name", data[key].type);
        $dl.append($dt);
        $dl.append($dd);
      }
    }
    return `<xml>${$dl[0].outerHTML}</xml>`;
  }

  fixBuggyFields() {
    if (!this.$element) {
      return false;
    }
    this.fixCheckboxGroups();
    this.fixRadioButtons();
    return this;
  }

  fixCheckboxGroups() {
    this.$element.find(".formbuilder-checkbox-group").each((_key, group) => {
      const inputs = $(".formbuilder-checkbox input", group);
      const $label = $(group).find("label");
      const data = this.spec.find((obj) => obj.type === "checkbox-group" && obj.name === $label.attr("for"));
      const values = data?.userData;
      if (!inputs.length || !data || !values) {
        return;
      }
      this.processCheckboxInputs(inputs, values);
      this.handleOtherOption(inputs, values);
    });
  }

  processCheckboxInputs(inputs, values) {
    inputs.each((_idx, input) => {
      const $input = $(input);
      let shouldCheck = false;
      let index = values.indexOf(input.value);
      if (index >= 0) {
        shouldCheck = true;
        values.splice(index, 1);
      } else {
        shouldCheck = this.checkByLabelMatch($input, values);
      }
      this.applyCheckboxState(input, shouldCheck);
    });
  }

  checkByLabelMatch($input, values) {
    const labelText = $input.closest("label").text().trim() ||
      $input.siblings("label").text().trim() || $input.parent().text().trim();
    if (labelText) {
      const matchIndex = values.findIndex((value) =>
        value === labelText || labelText.includes(value) || value.includes(labelText)
      );
      if (matchIndex >= 0) {
        values.splice(matchIndex, 1);
        return true;
      }
    }
    return false;
  }

  applyCheckboxState(input, shouldCheck) {
    if (shouldCheck) {
      if (!input.checked) {
        $(input).click();
      }
    } else if (input.checked) {
      $(input).click();
    }
  }

  handleOtherOption(inputs, values) {
    const otherOption = $(".other-option", inputs.parent())[0];
    const otherVal = $(".other-val", inputs.parent())[0];
    const otherText = values.join(" ");
    if (otherOption) {
      if (otherText) {
        otherOption.checked = true;
        otherOption.value = otherText;
        otherVal.value = otherText;
      } else {
        otherOption.checked = false;
        otherOption.value = "";
        otherVal.value = "";
      }
    }
  }

  fixRadioButtons() {
    this.$element.find(".formbuilder-radio input.other-val").on("input", (input) => {
      const $input = $(input.currentTarget);
      const $group = $input.closest(".formbuilder-radio-group");
      $group.find("input").each((_key, radio) => {
        const name = $(radio).attr("name");
        if (name && name.endsWith("[]")) {
          $(radio).attr("name", name.slice(0, -2));
        }
      });
    });
  }

  storeData() {
    if (!this.$element) {
      return false;
    }
    const $form = this.$element.closest("form");
    const $body = $form.find(`input[name="${this.$element.data("name")}"]`);
    if ($body.length && this.instance) {
      this.spec = this.instance.userData;
      this.fixUserDataValues();
      $body.val(this.dataToXML(this.spec));
      this.$element.data("spec", this.spec);
    }
    return this;
  }

  fixUserDataValues() {
    if (!this.spec || !this.$element) {
      return;
    }
    this.spec.forEach((field) => {
      if (!field.userData || field.userData.length === 0) {
        return;
      }
      const hasOnValues = field.userData.some((value) => value === "on");
      if (!hasOnValues) {
        return;
      }
      if (field.type === "checkbox-group") {
        CustomFieldsHelpers.fixCheckboxValues(this, field);
      } else if (field.type === "radio-group") {
        CustomFieldsHelpers.fixRadioValues(this, field);
      } else if (field.type === "select") {
        CustomFieldsHelpers.fixSelectValues(this, field);
      }
    });
  }

  extractLabelValue($checkbox, field, index) {
    return CustomFieldsHelpers.extractLabelValue($checkbox, field, index);
  }

  init($element) {
    this.$element = $element;
    this.spec = $element.data("spec");
    this.instance = $element.formRender({
      i18n: {
        locale: this.lang,
        location: window.DecidimAwesome.formBuilderLangsLocation
      },
      formData: this.spec,
      render: true,
      disableInjectedStyle: true,
      controlConfig: {
        "textarea.richtext": {
          editorOptions: $element.data("editorOptions")
        }
      }
    });
    this.fixBuggyFields();
  }
}
