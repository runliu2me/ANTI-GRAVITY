import pandas as pd
import os

file_path = r'c:\Users\runli\OneDrive\software\ANTI-GRAVITY\video-analysis\attach\视频团队工作流&已发布数据（业务数据表）_已发布视频数据(含中短视频).xlsx'

try:
    # Read the first few rows to get headers
    df = pd.read_excel(file_path, nrows=5)
    print("Columns found:")
    for col in df.columns:
        print(f"- {col}")
    
    print("\nFirst 3 rows of data:")
    print(df.head(3).to_string())
except Exception as e:
    print(f"Error reading Excel file: {e}")
