# ipyscore

A Jupyter widget for rendering music notation

## Installation

You can install `ipyscore` using `pip`:

```bash
pip install ipyscore
```

## Development Installation

Create a development environment:

```bash
micromamba create -n ipyscore
micromamba activate ipyscore
micromamba install -c conda-forge python nodejs
pip install jupyterlab
npm install
```

Install the Python package and build the TypeScript package.
```bash
pip install -e .
node_modules/.bin/esbuild --bundle --format=esm --outdir=ipyscore/static src/index.ts
```
