from pathlib import Path
from jupyter_server.base.handlers import JupyterHandler
import tornado


here = Path(__file__).parent


class IpyscoreHandler(JupyterHandler):

    def set_default_headers(self):
        self.set_header('Content-Type', "font/woff")

    @tornado.web.authenticated
    async def get(self, name):
        print(f"{here=}")
        print(f"{name=}")
        font = (here / "styles" / "fonts" / name).read_bytes()
        self.finish(font)
