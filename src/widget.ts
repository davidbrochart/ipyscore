// Copyright (c) David Brochart
// Distributed under the terms of the Modified BSD License.

import * as Vex from 'vexflow';

export function render({ model, el }) {
  const { Renderer } = Vex.Flow;

  const div = document.createElement("div");
  el.append(div);

  const renderer = new Renderer(div, Renderer.Backends.SVG);

  const width = model.get('width');
  const height = model.get('height');

  renderer.resize(width, height);
  const context = renderer.getContext();
  context.setFont('Arial', 10);

  let vf: Vex.Factory = new Vex.Flow.Factory({renderer: { elementId: null, width: 0, height: 0 }});
  vf.setContext(context);

  new Widget(model, vf);
}


class Widget {
  constructor(model, vf) {
    this.model = model;
    this.vf = vf;
    this.scores = {};
    this.systems = {};
    this.notes = {};
    this.voices = {};
    this.staves = {};

    model.on('change:_new_score_id', this.newScore);
    model.on('change:_new_system_id', this.newSystem);
    model.on('change:_new_notes_id', this.newScoreNotes);
    model.on('change:_new_beam_id', this.newScoreBeam);
    model.on('change:_new_tuplet_id', this.newScoreTuplet);
    model.on('change:_new_voice_id', this.newScoreVoice);
    model.on('change:_new_stave_id', this.addStave);
    model.on('change:_new_clef', this.addClef);
    model.on('change:_new_connector', this.addConnector);
    model.on('change:_new_time_signature', this.addTimeSignature);
    model.on('change:_concat_notes_id', this.concatNotes);
    model.on('change:_draw', this.draw);
  }

  newScore = () => {
    const score = this.vf.EasyScore();
    const new_score_id = this.model.get('_new_score_id');
    this.scores[new_score_id] = score;
  }

  newSystem = () => {
    const system = this.vf.System();
    const new_system_id = this.model.get('_new_system_id');
    this.systems[new_system_id] = system;
  }

  newScoreNotes = () => {
    const score_id = this.model.get('_score_id');
    const new_notes_id = this.model.get('_new_notes_id');
    const notes = this.model.get('_notes');
    const notes_options = this.model.get('_notes_options');
    this.notes[new_notes_id] = this.scores[score_id].notes(notes, notes_options);
  }

  newScoreBeam = () => {
    const score_id = this.model.get('_score_id');
    const notes_id = this.model.get('_notes_id');
    const notes = this.notes[notes_id];
    const new_beam_id = this.model.get('_new_beam_id');
    this.notes[new_beam_id] = this.scores[score_id].beam(notes);
  }

  newScoreTuplet = () => {
    const score_id = this.model.get('_score_id');
    const notes_id = this.model.get('_notes_id');
    const notes = this.notes[notes_id];
    const new_tuplet_id = this.model.get('_new_tuplet_id');
    this.notes[new_tuplet_id] = this.scores[score_id].tuplet(notes);
  }

  newScoreVoice = () => {
    const score_id = this.model.get('_score_id');
    const notes_id = this.model.get('_notes_id');
    const new_voice_id = this.model.get('_new_voice_id');
    this.voices[new_voice_id] = this.scores[score_id].voice(this.notes[notes_id]);
  }

  addStave = () => {
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

  addClef = () => {
    const stave_id = this.model.get('_stave_id');
    const clef = this.model.get('_clef');
    this.staves[stave_id].addClef(clef);
  }

  addConnector = () => {
    const system_id = this.model.get('_system_id');
    this.systems[system_id].addConnector();
  }

  addTimeSignature = () => {
    const stave_id = this.model.get('_stave_id');
    const time_signature = this.model.get('_time_signature');
    this.staves[stave_id].addTimeSignature(time_signature);
  }

  draw = () => {
    this.vf.draw();
  }

  concatNotes = () => {
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
