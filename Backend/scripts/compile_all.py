import py_compile, glob

files = glob.glob('Backend/app/**/*.py', recursive=True)
errs = 0
for f in files:
    try:
        py_compile.compile(f, doraise=True)
    except Exception as e:
        print('ERR', f, e)
        errs += 1
if errs == 0:
    print('All files compiled successfully')
else:
    print(f'{errs} files failed')
