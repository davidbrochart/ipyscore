// Copyright (c) David Brochart
// Distributed under the terms of the Modified BSD License.

import './jquery-global.js';
import * as Smo from './smoosic';

globalThis.Smo = Smo;

export function render({ model, el }) {
  const div = document.createElement("div");
  el.append(div);

  new Widget(model, div);
}


class Widget {
  constructor(model, div) {
    this.model = model;
    this.div = div;
    this.init();

    model.on('change:_move_selection_left', this.moveSelectionLeft);
    model.on('change:_move_selection_right', this.moveSelectionRight);
    model.on('change:_select_suggestion', this.selectSuggestion);
    model.on('change:_mouse_x', this.intersectingArtifact);
    model.on('change:_mouse_y', this.intersectingArtifact);
    model.on('change:_time_signature', this.setTimeSignature);
    model.on('change:_key_signature', this.setKeySignature);
    model.on('change:_new_staff', this.createStaff);
    model.on('change:_get_score', this.getScore);
  }

  init = async () => {
    const init = this.model.get('_init');
    if (!init) {
      return;
    }
    let initialScore = this.model.get('_initial_score');
    if (initialScore === null) {
      initialScore = Smo.basicJson;
    }
    const application = await Smo.SuiApplication.configure({
      mode: 'library',
      scoreDomContainer: this.div,
      initialScore: initialScore,
    });
    this.view = application.view;

    this.div.addEventListener('mousemove', (ev) => {
      this.view.intersectingArtifact({
          x: ev.clientX,
          y: ev.clientY
        });
    });
  }

  moveSelectionLeft = async () => {
    await this.view.moveSelectionLeft();
  }

  moveSelectionRight = async () => {
    await this.view.moveSelectionRight();
  }

  selectSuggestion = () => {
    this.view.selectSuggestion(this.view.score, {type: 'click'});
  }

  intersectingArtifact = () => {
    const mouseX = this.model.get("_mouse_x");
    const mouseY = this.model.get("_mouse_y");
    this.view.intersectingArtifact({x: mouseX, y: mouseY});
  }

  setTimeSignature = () => {
    const timeSignature = this.model.get("_time_signature");
    this.view.setTimeSignature(Smo.SmoMeasure.convertLegacyTimeSignature(timeSignature));
  }

  setKeySignature = () => {
    const keySignature = this.model.get("_key_signature");
    this.view.addKeySignature(keySignature);
  }

  createStaff = async () => {
    const clef = this.model.get("_new_staff_clef");
    const keyOffset = this.model.get("_new_staff_key_offset");
    const instrumentName = this.model.get("_new_staff_instrument_name");
    const align = this.model.get("_new_staff_align");
    const selection = this.view.tracker.selections[0];
    const instrument = new Smo.SmoInstrument(this.view.score.getStaffInstrument(selection.selector));
    instrument.keyOffset = keyOffset;
    instrument.instrumentName = instrumentName;
    instrument.clef = clef;
    const staffParams: Smo.SmoSystemStaffParams = Smo.SmoSystemStaff.defaults;
    staffParams.staffId = this.view.storeScore.staves.length;
    staffParams.measureInstrumentMap[0] = instrument;
    staffParams.alignWithPrevious = align;
    await this.view.addStaff(staffParams);
  }

  getScore = () => {
    const score = JSON.stringify(this.view.storeScore.serialize());
    this.model.set('_score', score);
    this.model.save_changes();
  }
}
