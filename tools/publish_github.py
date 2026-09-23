"""Create AI_revolution once, using an existing GitHub CLI or Git Credential Manager login."""
import argparse,os,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def run(args,env=None):
 return subprocess.run(args,cwd=ROOT,env=env,text=True,encoding='utf8',capture_output=True)

def authenticated_env(account=None):
 env=os.environ.copy()
 check=run(['gh','api','user','--jq','.login'],env)
 if check.returncode==0:
  login=check.stdout.strip()
  if account and login!=account:raise RuntimeError('GitHub CLI is authenticated as a different account')
  return env,login
 # Use the system credential provider, not a token file. Never log returned fields.
 if not account:
  listed=run(['git','credential-manager','github','list'])
  accounts=[s.strip() for s in listed.stdout.splitlines() if s.strip()]
  if listed.returncode or len(accounts)!=1:raise RuntimeError('Run gh auth login, or specify --account for an existing Git Credential Manager login')
  account=accounts[0]
 result=subprocess.run(['git','credential','fill'],cwd=ROOT,input=f'protocol=https\nhost=github.com\nusername={account}\n\n',text=True,encoding='utf8',capture_output=True,env=dict(env,GIT_TERMINAL_PROMPT='0',GCM_INTERACTIVE='never'))
 fields=dict(line.split('=',1) for line in result.stdout.splitlines() if '=' in line)
 if result.returncode or not fields.get('password'):raise RuntimeError('No usable existing login; run gh auth login')
 env['GH_TOKEN']=fields['password']
 check=run(['gh','api','user','--jq','.login'],env)
 if check.returncode or check.stdout.strip()!=account:raise RuntimeError('Existing credential could not verify the expected GitHub account')
 return env,check.stdout.strip()

def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--public',action='store_true');p.add_argument('--account');a=p.parse_args()
 env,account=authenticated_env(a.account)
 for script in ['check_repository.py','check_evidence.py']:
  subprocess.run([sys.executable,'-X','utf8',str(ROOT/'tools'/script)],cwd=ROOT,check=True)
 status=run(['git','status','--porcelain'])
 if status.returncode or status.stdout.strip():raise RuntimeError('Commit reviewed local changes before publishing')
 if run(['git','rev-parse','--verify','HEAD']).returncode:raise RuntimeError('No local commit')
 if 'origin' in run(['git','remote']).stdout.split():raise RuntimeError('origin exists; inspect it and push normally instead of creating another repository')
 name=f'{account}/AI_revolution'
 existing=run(['gh','api',f'repos/{name}'],env)
 if existing.returncode==0:raise RuntimeError('The repository already exists; no remote was changed')
 if '404' not in existing.stderr:raise RuntimeError('Could not establish that the target repository is absent; no repository created')
 created=run(['gh','repo','create',name,'--public' if a.public else '--private','--source','.','--remote','origin','--push','--description','rainbow鱼 AI进化史：六章可视化教学、真实实验、补充资料与 Remotion 工程'],env)
 if created.returncode:raise RuntimeError('GitHub create/push failed. Inspect gh repo view and git remote before retrying; the remote may have been created')
 info=run(['gh','repo','view',name,'--json','url,visibility'],env)
 if info.returncode:raise RuntimeError('Push completed but repository metadata query failed')
 print(info.stdout.strip())

if __name__=='__main__':
 try:main()
 except (RuntimeError,subprocess.CalledProcessError) as exc:
  print(str(exc),file=sys.stderr);raise SystemExit(1)
