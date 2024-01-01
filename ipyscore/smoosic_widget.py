import asyncio
import json
from pathlib import Path

from anywidget import AnyWidget
from ipyevents import Event
from traitlets import Bool, Int, Unicode


bundler_output_dir = Path(__file__).parent / "static"


class Widget(AnyWidget):
    _esm = bundler_output_dir / "smoosic_index.js"

    _initial_score = Unicode(allow_none=True, default_value=None).tag(sync=True)
    _init = Bool().tag(sync=True)
    _move_selection_left = Bool().tag(sync=True)
    _move_selection_right = Bool().tag(sync=True)
    _select_suggestion = Bool().tag(sync=True)
    _mouse_x = Int().tag(sync=True)
    _mouse_y = Int().tag(sync=True)
    _time_signature = Unicode().tag(sync=True)
    _key_signature = Unicode().tag(sync=True)
    _new_staff = Bool().tag(sync=True)
    _new_staff_clef = Unicode().tag(sync=True)
    _new_staff_key_offset = Int().tag(sync=True)
    _new_staff_instrument_name = Unicode().tag(sync=True)
    _new_staff_align = Bool().tag(sync=True)
    _get_score = Bool().tag(sync=True)
    _score = Unicode().tag(sync=True)

    def __init__(self, initial_score: dict | None = None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._event = Event(source=self, watched_events=["click", "keydown", "mousemove"])
        self._event.on_dom_event(self._handle_event)
        self._initial_score = initial_score
        self._init = True

    def _handle_event(self, event):
        if event["type"] == "keydown":
            code = event["code"]
            if code == "ArrowLeft":
                self.move_selection_left()
            elif code == "ArrowRight":
                self.move_selection_right()
        #elif event["type"] == "mousemove":
        #    self._mouse_x = event["clientX"]
        #    self._mouse_y = event["clientY"]
        elif event["type"] == "click":
            self.select_suggestion()

    def move_selection_left(self):
        self._move_selection_left = not self._move_selection_left

    def move_selection_right(self):
        self._move_selection_right = not self._move_selection_right

    def select_suggestion(self):
        self._select_suggestion = not self._select_suggestion

    def set_time_signature(self, text: str):
        self._time_signature = text

    def set_key_signature(self, text: str):
        self._key_signature = text

    def add_staff(self, clef: str = "treble", key_offset: int = 0, instrument_name: str = "piano", align: bool = True):
        self._new_staff_clef = clef
        self._new_staff_key_offset = key_offset
        self._new_staff_instrument_name = instrument_name
        self._new_staff_align = align
        self._new_staff = not self._new_staff

    async def get_score(self):
        self._get_score = not self._get_score
        await wait_for_change(self, "_score")
        score = json.loads(self._score)
        self._score = ""
        return score


def wait_for_change(widget, value):
    future = asyncio.Future()
    def getvalue(change):
        future.set_result(change.new)
        widget.unobserve(getvalue, value)
    widget.observe(getvalue, value)
    return future
