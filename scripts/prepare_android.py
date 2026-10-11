import os, pathlib, shutil, re, xml.sax.saxutils
root = pathlib.Path(__file__).resolve().parents[1]
template = root / "android-template"
out = root / "android-project"
if out.exists(): shutil.rmtree(out)
shutil.copytree(template, out)
url = os.environ["SITE_URL"].strip()
name = os.environ["APP_NAME"].strip()
package = os.environ["PACKAGE_NAME"].strip()
color = os.environ["THEME_COLOR"].strip()
for f in [out/"app/build.gradle", out/"app/src/main/java/com/web2apk/template/MainActivity.java", out/"app/src/main/res/values/strings.xml", out/"app/src/main/res/values/colors.xml", out/"app/src/main/AndroidManifest.xml"]:
    s=f.read_text()
    s=s.replace("__PACKAGE_NAME__", package).replace("__SITE_URL__", url).replace("__APP_NAME__", xml.sax.saxutils.escape(name)).replace("__THEME_COLOR__", color)
    f.write_text(s)
# Move MainActivity into package folder after replacing package declaration.
java_root=out/"app/src/main/java"
old=java_root/"com/web2apk/template"
new=java_root.joinpath(*package.split("."))
new.parent.mkdir(parents=True, exist_ok=True)
if new.exists(): shutil.rmtree(new)
shutil.move(str(old), str(new))
for parent in [old.parent, old.parent.parent, old.parent.parent.parent]:
    try: parent.rmdir()
    except OSError: pass
# Optional manifest permissions. Runtime permission prompts are not implemented in this starter.
manifest=out/"app/src/main/AndroidManifest.xml"
s=manifest.read_text()
extra=[]
if os.environ.get("CAMERA")=="true": extra.append('    <uses-permission android:name="android.permission.CAMERA" />')
if os.environ.get("LOCATION")=="true":
    extra += ['    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />','    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />']
if os.environ.get("FILES")=="true":
    extra.append('    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />')
s=s.replace('    <application', "\n".join(extra) + ('\n' if extra else '') + '    <application')
manifest.write_text(s)
print("Prepared project for", package)
