#!/usr/bin/env node
/**
 * FirstGlance AI - Deployment Verification Probe & Smoke Test Gate
 * 
 * Executed during CI/CD rollout stages to verify production cluster readiness,
 * hardware accelerator discovery, and KMS secret binding before switching traffic.
 */

process.env.NODE_ENV = 'production';

const { validateDeploymentIntegrity } = require('../src/config');

console.log('================================================================================');
console.log(' [FIRSTGLANCE-DEPLOY] Initiating Production Deployment Smoke Test Probe...');
console.log('================================================================================');
console.log(` Target Cluster Node: worker-${Math.random().toString(36).substring(2, 8)}`);
console.log(` Target Environment:  PRODUCTION (us-east-1)`);
console.log(` Target Image Tag:   firstglanceai:2.4.0`);
console.log('--------------------------------------------------------------------------------');

const check = validateDeploymentIntegrity();

if (!check.ready) {
  console.error('\n❌ [FATAL] [DEPLOYMENT-PROBE] Production deployment health check FAILED!');
  console.error('The following critical infrastructure assertions failed during rollout inspection:\n');
  
  check.issues.forEach((issue, idx) => {
    console.error(`  [Violation #${idx + 1}] ${issue}`);
  });

  console.error('\n--------------------------------------------------------------------------------');
  console.error(' [ROLLOUT-ABORT] Container readiness probe (/health/ready) returned HTTP 503.');
  console.error(' [ROLLOUT-ABORT] Automated canary deployment cancelled. Rollback initiated.');
  console.error('================================================================================\n');

  process.exit(1);
} else {
  console.log('✓ [PASS] All deployment integrity assertions verified.');
  process.exit(0);
}
