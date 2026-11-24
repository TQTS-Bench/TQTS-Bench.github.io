import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch
from datetime import datetime, timezone

spec=importlib.util.spec_from_file_location('collector',Path(__file__).resolve().parents[1]/'collect_papers.py')
c=importlib.util.module_from_spec(spec);spec.loader.exec_module(c)
NOW=datetime(2026,11,25,tzinfo=timezone.utc)

def paper(pid='2601.12345',title='A query method',abstract='General natural language queries over time series.'):
    return dict(id=pid,version=1,title=title,abstract=abstract,published='2026-01-01T00:00:00Z',updated='2026-01-01T00:00:00Z',url='https://arxiv.org/abs/'+pid,codeUrl=None)

class DiscoveryTests(unittest.TestCase):
    def run_collect(self,papers,fulltext='A long paper with no named benchmark.',previous=None):
        with patch.object(c,'query_arxiv',return_value=papers),patch.object(c,'full_text',return_value=(fulltext,'https://arxiv.org/html/2601.12345')):
            return c.collect(previous or {'schemaVersion':2,'papers':[]}, {}, {}, NOW)
    def test_related_paper_without_evidence_is_excluded(self):
        result,errors=self.run_collect([paper()]);self.assertEqual(result['papers'],[]);self.assertFalse(errors)
    def test_fulltext_reference_is_included_without_scores_or_authors(self):
        result,errors=self.run_collect([paper()], 'We evaluate on TQTS-Bench and achieve an overall EX of 88%.')
        self.assertEqual(len(result['papers']),1)
        self.assertNotIn('reportedResults',result);self.assertNotIn('overall',result['papers'][0]);self.assertNotIn('authors',result['papers'][0])
    def test_self_paper_excluded_even_when_name_matches(self):
        result,_=self.run_collect([paper(title='TQTS-Bench: A Multi-Syntax Benchmark',abstract='TQTS-Bench')]);self.assertEqual(result['papers'],[])
    def test_failed_search_preserves_success_timestamp_and_records(self):
        old=paper();old['evidence']={'text':'Uses TQTS-Bench','url':old['url']}
        previous={'schemaVersion':2,'lastSuccessfulSync':'2026-11-24T00:00:00Z','papers':[old]}
        with patch.object(c,'query_arxiv',side_effect=RuntimeError('network')),patch.object(c,'full_text',side_effect=RuntimeError('network')):
            result,errors=c.collect(previous,{}, {}, NOW)
        self.assertTrue(errors);self.assertEqual(result['lastAttemptStatus'],'failed')
        self.assertEqual(result['lastSuccessfulSync'],previous['lastSuccessfulSync']);self.assertEqual(len(result['papers']),1)
    def test_old_unrelated_records_not_grandfathered(self):
        result,_=self.run_collect([],previous={'schemaVersion':1,'papers':[paper()]})
        self.assertEqual(result['papers'],[])
    def test_new_version_is_rechecked(self):
        p=paper();p['version']=2
        cache={p['id']:{'version':1,'checkedAt':'2026-11-25T00:00:00Z','evidence':None}}
        with patch.object(c,'query_arxiv',return_value=[p]),patch.object(c,'full_text',return_value=('Cites TQTS-Bench','https://arxiv.org/html/2601.12345v2')) as read:
            result,_=c.collect({'schemaVersion':2,'papers':[]},{},cache,NOW)
        read.assert_called_once();self.assertEqual(result['papers'][0]['version'],2)
    def test_unicode_hyphen_reference(self):
        self.assertIsNotNone(c.evidence('Evaluated on TQTS–Bench.', 'https://arxiv.org'))

if __name__=='__main__':unittest.main()
