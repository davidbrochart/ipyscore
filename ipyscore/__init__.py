# Copyright (c) David Brochart.
# Distributed under the terms of the Modified BSD License.

from .vexflow_widget import Widget as VexflowWidget
from .smoosic_widget import Widget as SmoosicWidget
from .server_extension import _jupyter_server_extension_paths, _load_jupyter_server_extension, _jupyter_nbextension_paths

load_jupyter_server_extension = _load_jupyter_server_extension

__version__ = "0.2.0"
