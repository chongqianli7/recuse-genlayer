import sys,types,unittest,importlib.util,json,copy
from pathlib import Path
class Return:
    def __init__(self,value):self.calldata=value
class Error(Exception):pass
sender=types.SimpleNamespace(sender_address='0x'+'1'*40)
answers=[]
last_validator=None
def nondet(leader,validator):
    global last_validator
    last_validator=validator
    result=leader()
    if not validator(Return(result)):raise Error('DISAGREEMENT')
    return result
host=types.SimpleNamespace(Contract=object,public=types.SimpleNamespace(write=lambda f:f,view=lambda f:f),vm=types.SimpleNamespace(UserError=Error,Return=Return,run_nondet_unsafe=nondet),message=sender,nondet=types.SimpleNamespace(exec_prompt=lambda *a,**k:answers.pop(0)))
sys.modules['genlayer']=types.SimpleNamespace(gl=host,TreeMap=dict)
spec=importlib.util.spec_from_file_location('contract',Path(__file__).parents[1]/'contracts/recuse.py');c=importlib.util.module_from_spec(spec);spec.loader.exec_module(c)
A,B,C,D=['0x'+n*40 for n in '1234']
P='Appoint Cedar Workshop Ltd as the paid operator of our community hall.'
S=['I own Cedar Workshop Ltd and would benefit from this paid appointment.','I have no relevant financial or family interests in Cedar Workshop Ltd.','I have no relevant financial or family interests in Cedar Workshop Ltd.']
def matrix(kinds=('DIRECT','NONE','NONE')):return [dict(member=m,kind=k,declaration_quote=s,proposal_quote='Cedar Workshop Ltd',reason='The declared relationship is assessed against this appointment.') for m,s,k in zip([A,B,C],S,kinds)]
class Tests(unittest.TestCase):
 def setUp(self):
    answers.clear();sender.sender_address=A;self.r=c.Recuse();self.r.propose('case','Appoint operator',P,json.dumps([A,B,C]))
 def load(self):return json.loads(self.r.get_case(A,'case'))
 def declarations(self):
    for m,s in zip([A,B,C],S):sender.sender_address=m;self.r.declare(A,'case',s)
 def assess(self,kinds=('DIRECT','NONE','NONE')):
    self.declarations();answers.extend([matrix(kinds),matrix(kinds)]);self.r.assess(A,'case')
 def test_immutable_ids_and_namespace(self):
    with self.assertRaisesRegex(Error,'ID_USED'):self.r.propose('case','Different',P,json.dumps([A,B,C]))
    sender.sender_address=B;self.r.propose('case','Different',P,json.dumps([A,B,C]));self.assertEqual(json.loads(self.r.get_case(B,'case'))['owner'],B)
 def test_individual_signatures_and_no_rewrite(self):
    sender.sender_address=D
    with self.assertRaisesRegex(Error,'NOT_MEMBER'):self.r.declare(A,'case',S[0])
    sender.sender_address=A;self.r.declare(A,'case',S[0])
    with self.assertRaisesRegex(Error,'ALREADY_DECLARED'):self.r.declare(A,'case',S[1])
 def test_incomplete_matrix_never_opens_vote(self):
    with self.assertRaisesRegex(Error,'INCOMPLETE'):self.r.assess(A,'case')
    self.assertEqual(self.load()['status'],'DISCLOSURES')
 def test_conflict_excludes_and_full_vote_finishes(self):
    self.assess();self.assertEqual(self.load()['eligible'],[B,C]);sender.sender_address=A
    with self.assertRaisesRegex(Error,'RECUSED'):self.r.vote(A,'case','YES')
    sender.sender_address=B;self.r.vote(A,'case','YES')
    with self.assertRaisesRegex(Error,'NOT_DECISIVE'):self.r.finalize(A,'case')
    sender.sender_address=C;self.r.vote(A,'case','YES');sender.sender_address=D;self.r.finalize(A,'case');self.assertEqual(self.load()['status'],'PASSED')
    with self.assertRaisesRegex(Error,'NOT_VOTING'):self.r.vote(A,'case','NO')
 def test_disagreement_leaves_electorate_unset(self):
    self.declarations();answers.extend([matrix(),matrix(('NONE','NONE','NONE'))])
    with self.assertRaisesRegex(Error,'DISAGREEMENT'):self.r.assess(A,'case')
    self.assertEqual(self.load()['eligible'],[])
 def test_forged_or_cross_member_quote_rejected(self):
    self.declarations();x=matrix();x[0]['declaration_quote']=S[1];answers.append(x)
    with self.assertRaisesRegex(Error,'UNSUPPORTED_QUOTE'):self.r.assess(A,'case')
    self.assertEqual(self.load()['status'],'DISCLOSURES')
 def test_unknown_is_excluded_and_insufficient_electorate_terminal(self):
    self.assess(('UNCLEAR','DIRECT','NONE'));self.assertEqual(self.load()['status'],'NO_ELECTORATE')
 def test_locked_declaration_and_repeat_vote(self):
    self.assess();sender.sender_address=B
    with self.assertRaisesRegex(Error,'LOCKED'):self.r.declare(A,'case',S[1])
    self.r.vote(A,'case','ABSTAIN')
    with self.assertRaisesRegex(Error,'ALREADY_VOTED'):self.r.vote(A,'case','YES')
    sender.sender_address=C;self.r.vote(A,'case','YES');self.r.finalize(A,'case');self.assertEqual(self.load()['status'],'REJECTED')
 def test_validator_rejects_non_return_and_malformed_output(self):
    self.assess();self.assertFalse(last_validator(None));self.assertFalse(last_validator(Return([])))
 def test_members_invalid_duplicate_zero_and_bounds(self):
    for members in [[A,A,B],[A,B],['0x'+'0'*40,B,C]]:
      with self.assertRaises(Error):self.r.propose('bad','Title',P,json.dumps(members))
 def test_tally_matches_model_across_vote_combinations(self):
    import itertools
    for n in range(2,8):
      members=[str(i) for i in range(n)]
      for choices in itertools.product(['YES','NO','ABSTAIN',''],repeat=n):
        votes={m:v for m,v in zip(members,choices) if v};r=c.outcome(dict(eligible=members,votes=votes));yes=choices.count('YES');remaining=choices.count('');ready=len(votes)>=(2*n+2)//3 and (yes>=n//2+1 or yes+remaining<n//2+1)
        self.assertEqual(r['ready'],ready)
if __name__=='__main__':unittest.main()
