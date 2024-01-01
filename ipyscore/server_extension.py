from .handler import IpyscoreHandler
from jupyter_server.utils import url_path_join


def _load_jupyter_server_extension(serverapp):
    """
    This function is called when the extension is loaded.
    """

    web_app = serverapp.web_app
    host_pattern = '.*$'
    route_pattern = url_path_join(web_app.settings['base_url'], '/styles/fonts/(.*)')
    print(f"{route_pattern=}")
    web_app.add_handlers(host_pattern, [(route_pattern, IpyscoreHandler)])




def _jupyter_nbextension_paths():
    return [dict(
        section="notebook",
        src="static",
        dest="ipyscore",
        require="ipyscore/extension")]


def _jupyter_server_extension_paths():
    """
    Returns a list of dictionaries with metadata describing
    where to find the `_load_jupyter_server_extension` function.
    """
    return [
        {
            "module": "ipyscore"
        }
    ]
