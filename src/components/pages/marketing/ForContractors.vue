<template>
    <div class="container py-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">For contractors</h2>
            <router-link to="/" class="btn btn-outline-secondary">Home</router-link>
        </div>

        <div class="row g-4 mb-4">
            <div class="col-lg-7">
                <p class="lead text-muted">
                    Keep compliance documents current, apply faster, and see exactly what’s missing before you waste time.
                </p>
                <ul class="text-muted">
                    <li>Upload COIs, workers’ comp, bonds, licenses, certifications</li>
                    <li>Track expiration dates and “expiring soon” status</li>
                    <li>Apply to contracts with one click + auto-attached docs</li>
                    <li>When non-compliant, match to brokerages that can help</li>
                </ul>

                <div class="d-flex gap-2 flex-wrap">
                    <router-link to="/signup?role=contractor" class="btn btn-primary">Create contractor account</router-link>
                    <router-link to="/login" class="btn btn-outline-primary">Log in</router-link>
                </div>
            </div>
            <div class="col-lg-5">
                <div class="card p-4">
                    <h5 class="mb-2">Recommended first steps</h5>
                    <ol class="text-muted mb-0">
                        <li>Create your profile</li>
                        <li>Upload your current docs</li>
                        <li>Browse contracts and apply</li>
                    </ol>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-body">
                <h5 class="card-title">Built for trust</h5>
                <p class="text-muted mb-0">
                    Compliance checks are deterministic and auditable. Document uploads are timestamped and versioned.
                </p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ForContractors'
}
</script>

<style scoped>
.card {
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>

