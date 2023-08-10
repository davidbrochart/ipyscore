#!/usr/bin/env python
# coding: utf-8

# Copyright (c) David Brochart.
# Distributed under the terms of the Modified BSD License.

"""
TODO: Add module docstring
"""

from uuid import uuid4

from ipywidgets import DOMWidget
from traitlets import Bool, Dict, Int, List, Unicode
from ._frontend import module_name, module_version


class Widget(DOMWidget):
    """TODO: Add docstring here
    """
    _model_name = Unicode('WidgetModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode('WidgetView').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    width = Int(500).tag(sync=True)
    height = Int(500).tag(sync=True)
    _voice_ids = List().tag(sync=True)
    _clef = Unicode().tag(sync=True)
    _stave_id = Unicode().tag(sync=True)
    _time_signature = Unicode().tag(sync=True)
    _system_id = Unicode().tag(sync=True)
    _score_id = Unicode().tag(sync=True)
    _notes_id = Unicode().tag(sync=True)
    _notes = Unicode().tag(sync=True)
    _notes_options = Dict().tag(sync=True)
    _new_score_id = Unicode().tag(sync=True)
    _new_system_id = Unicode().tag(sync=True)
    _new_notes_id = Unicode().tag(sync=True)
    _new_voice_id = Unicode().tag(sync=True)
    _new_stave_id = Unicode().tag(sync=True)
    _new_clef = Bool().tag(sync=True)
    _new_time_signature = Bool().tag(sync=True)
    _draw = Bool().tag(sync=True)

    def Score(self):
        self._new_score_id = uuid4().hex
        return Score(self._new_score_id, self)

    def System(self):
        self._new_system_id = uuid4().hex
        return System(self._new_system_id, self)

    def draw(self):
        self._draw = not self._draw


class Score:
    def __init__(self, id_, widget: Widget):
        self.id = id_
        self.widget = widget

    def notes(self, notes: str, notes_options = {}):
        self.widget._notes = notes
        self.widget._notes_options = notes_options
        self.widget._score_id = self.id
        self.widget._new_notes_id = uuid4().hex
        return Notes(self.widget._new_notes_id)

    def voice(self, notes: "Notes"):
        self.widget._score_id = self.id
        self.widget._notes_id = notes.id
        self.widget._new_voice_id = uuid4().hex
        return Voice(self.widget._new_voice_id)


class System:
    def __init__(self, id_, widget: Widget):
        self.id = id_
        self.widget = widget

    def add_stave(self, options):
        self.widget._system_id = self.id
        if "voices" in options:
            self.widget._voice_ids = [voice.id for voice in options["voices"]]
        self.widget._new_stave_id = uuid4().hex
        return Stave(self.widget._new_stave_id, self.widget)


class Notes:
    def __init__(self, id):
        self.id = id


class Voice:
    def __init__(self, id):
        self.id = id


class Stave:
    def __init__(self, id_, widget: Widget):
        self.id = id_
        self.widget = widget

    def add_clef(self, clef: str):
        self.widget._stave_id = self.id
        self.widget._clef = clef
        self.widget._new_clef = not self.widget._new_clef
        return self

    def add_time_signature(self, time_signature: str):
        self.widget._stave_id = self.id
        self.widget._time_signature = time_signature
        self.widget._new_time_signature = not self.widget._new_time_signature
        return self