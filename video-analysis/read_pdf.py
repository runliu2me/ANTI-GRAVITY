import sys

try:
    import pypdf
    print("pypdf is installed")
    reader = pypdf.PdfReader(r'c:\Users\runli\OneDrive\software\ANTI-GRAVITY\video-analysis\attach\视频号数据分类深度分析报告_(V2).pdf')
    for i in range(min(5, len(reader.pages))): # Read first 5 pages to get the gist
        print(f"--- Page {i+1} ---")
        print(reader.pages[i].extract_text())
except ImportError:
    try:
        import PyPDF2
        print("PyPDF2 is installed")
        reader = PyPDF2.PdfReader(r'c:\Users\runli\OneDrive\software\ANTI-GRAVITY\video-analysis\attach\视频号数据分类深度分析报告_(V2).pdf')
        for i in range(min(5, len(reader.pages))):
            print(f"--- Page {i+1} ---")
            print(reader.pages[i].extract_text())
    except ImportError:
        print("Neither pypdf nor PyPDF2 is installed.")
