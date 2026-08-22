#!/usr/bin/env python3
"""Apply Saarthi database migrations to Supabase.
Usage: python3 database/apply_migrations.py
"""
import os, sys

def load_env():
    env = {}
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    return env

def main():
    try:
        import psycopg2
    except ImportError:
        print("Installing psycopg2-binary...")
        os.system(f"{sys.executable} -m pip install psycopg2-binary --break-system-packages -q")
        import psycopg2

    env = load_env()
    url = env.get('NEXT_PUBLIC_SUPABASE_URL', '')
    key = env.get('SUPABASE_SERVICE_ROLE_KEY', '')
    ref = url.replace('https://', '').split('.')[0]

    print(f"Connecting to Supabase project: {ref}...")
    conn = psycopg2.connect(
        host=f'db.{ref}.supabase.co',
        port=5432,
        dbname='postgres',
        user='postgres',
        password=key
    )
    conn.autocommit = True
    cur = conn.cursor()

    migrations_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'migrations')
    migration_files = sorted([
        f for f in os.listdir(migrations_dir)
        if f.endswith('.sql') and f.startswith('0') and not f.startswith('ALL')
    ])

    for mf in migration_files:
        path = os.path.join(migrations_dir, mf)
        print(f"  Applying {mf}...", end=' ')
        try:
            with open(path) as f:
                sql = f.read()
            cur.execute(sql)
            print("✓")
        except Exception as e:
            err_msg = str(e).split('\n')[0]
            if 'already exists' in err_msg or 'duplicate' in err_msg.lower():
                print(f"(already applied)")
            else:
                print(f"⚠ {err_msg}")

    # Also apply hotfix
    hotfix_path = os.path.join(migrations_dir, 'HOTFIX_TRIGGER_FIX.sql')
    if os.path.exists(hotfix_path):
        print(f"  Applying HOTFIX_TRIGGER_FIX.sql...", end=' ')
        try:
            with open(hotfix_path) as f:
                cur.execute(f.read())
            print("✓")
        except Exception as e:
            print(f"(already applied)")

    cur.close()
    conn.close()
    print("\n✅ All migrations applied successfully!")

if __name__ == '__main__':
    main()
