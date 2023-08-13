// Copyright (c) David Brochart
// Distributed under the terms of the Modified BSD License.

import {
  DOMWidgetModel,
  DOMWidgetView,
  ISerializers,
} from '@jupyter-widgets/base';

import { MODULE_NAME, MODULE_VERSION } from './version';

// Import the CSS
import '../css/widget.css';

import * as Vex from 'vexflow';

export class WidgetModel extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: WidgetModel.model_name,
      _model_module: WidgetModel.model_module,
      _model_module_version: WidgetModel.model_module_version,
      _view_name: WidgetModel.view_name,
      _view_module: WidgetModel.view_module,
      _view_module_version: WidgetModel.view_module_version,

      width: 500,
      height: 500,
      _voice_ids: [],
      _clef: '',
      _stave_id: '',
      _time_signature: '',
      _system_id: '',
      _score_id: '',
      _notes_id: '',
      _other_notes_id: '',
      _notes: '',
      _notes_options: {},
      _new_score_id: '',
      _new_system_id: '',
      _new_notes_id: '',
      _new_beam_id: '',
      _new_tuplet_id: '',
      _new_voice_id: '',
      _new_stave_id: '',
      _new_clef: false,
      _new_connector: false,
      _new_time_signature: false,
      _concat_notes_id: '',
      _draw: false,
    };
  }

  static serializers: ISerializers = {
    ...DOMWidgetModel.serializers,
    // Add any extra serializers here
  };

  static model_name = 'WidgetModel';
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = 'WidgetView'; // Set to null if no view
  static view_module = MODULE_NAME; // Set to null if no view
  static view_module_version = MODULE_VERSION;
}

export class WidgetView extends DOMWidgetView {
  render() {
    this.model.on('change:_new_score_id', this.newScore, this);
    this.model.on('change:_new_system_id', this.newSystem, this);
    this.model.on('change:_new_notes_id', this.newScoreNotes, this);
    this.model.on('change:_new_beam_id', this.newScoreBeam, this);
    this.model.on('change:_new_tuplet_id', this.newScoreTuplet, this);
    this.model.on('change:_new_voice_id', this.newScoreVoice, this);
    this.model.on('change:_new_stave_id', this.addStave, this);
    this.model.on('change:_new_clef', this.addClef, this);
    this.model.on('change:_new_connector', this.addConnector, this);
    this.model.on('change:_new_time_signature', this.addTimeSignature, this);
    this.model.on('change:_concat_notes_id', this.concatNotes, this);
    this.model.on('change:_draw', this.draw, this);

    const { Renderer } = Vex.Flow;

    const div = document.createElement("div");
    this.el.append(div);

    const renderer = new Renderer(div, Renderer.Backends.SVG);

    const width = this.model.get('width');
    const height = this.model.get('height');

    renderer.resize(width, height);
    const context = renderer.getContext();
    context.setFont('Arial', 10);

    this.vf = new Vex.Flow.Factory({renderer: { elementId: null, width: 0, height: 0 }});
    this.vf.setContext(context);

    this.scores = {};
    this.systems = {};
    this.notes = {};
    this.voices = {};
    this.staves = {};
  }

  newScore() {
    const score = this.vf.EasyScore();
    const id = this.model.get('_new_score_id');
    this.scores[id] = score;
  }

  newSystem() {
    const system = this.vf.System();
    const id = this.model.get('_new_system_id');
    this.systems[id] = system;
  }

  newScoreNotes() {
    const score_id = this.model.get('_score_id');
    const new_notes_id = this.model.get('_new_notes_id');
    const notes = this.model.get('_notes');
    const notes_options = this.model.get('_notes_options');
    this.notes[new_notes_id] = this.scores[score_id].notes(notes, notes_options);

  }

  newScoreBeam() {
    const score_id = this.model.get('_score_id');
    const notes_id = this.model.get('_notes_id');
    const notes = this.notes[notes_id];
    const new_beam_id = this.model.get('_new_beam_id');
    this.notes[new_beam_id] = this.scores[score_id].beam(notes);
  }

  newScoreTuplet() {
    const score_id = this.model.get('_score_id');
    const notes_id = this.model.get('_notes_id');
    const notes = this.notes[notes_id];
    const new_tuplet_id = this.model.get('_new_tuplet_id');
    this.notes[new_tuplet_id] = this.scores[score_id].tuplet(notes);
  }

  newScoreVoice() {
    const score_id = this.model.get('_score_id');
    const notes_id = this.model.get('_notes_id');
    const new_voice_id = this.model.get('_new_voice_id');
    this.voices[new_voice_id] = this.scores[score_id].voice(this.notes[notes_id]);
  }

  addStave() {
    const system_id = this.model.get('_system_id');
    const new_stave_id = this.model.get('_new_stave_id');
    const voice_ids = this.model.get('_voice_ids');
    var voices = [];
    var voice_id: string;
    for (voice_id of voice_ids) {
      voices.push(this.voices[voice_id]);
    }
    this.staves[new_stave_id] = this.systems[system_id].addStave({voices});
  }

  addClef() {
    const stave_id = this.model.get('_stave_id');
    const clef = this.model.get('_clef');
    this.staves[stave_id].addClef(clef);
  }

  addConnector() {
    const system_id = this.model.get('_system_id');
    this.systems[system_id].addConnector();
  }

  addTimeSignature() {
    const stave_id = this.model.get('_stave_id');
    const time_signature = this.model.get('_time_signature');
    this.staves[stave_id].addTimeSignature(time_signature);
  }

  draw() {
    this.vf.draw();
  }

  concatNotes() {
    const notes_id = this.model.get('_notes_id');
    const other_notes_id = this.model.get('_other_notes_id');
    const concat_notes_id = this.model.get('_concat_notes_id');
    const notes = this.notes[notes_id];
    const other_notes = this.notes[other_notes_id];
    this.notes[concat_notes_id] = notes.concat(other_notes);
  }

  vf: Vex.Factory;
  scores: {[id: string]: Vex.EasyScore};
  systems: {[id: string]: Vex.System};
  notes: {[id: string]: Vex.StemmableNote[]};
  voices: {[id: string]: Vex.Voice};
  staves: {[id: string]: Vex.Stave};
}
