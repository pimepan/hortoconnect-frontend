<template>
    <div class="container py-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">For brokerages / agents</h2>
            <router-link to="/" class="btn btn-outline-secondary">Home</router-link>
        </div>

        <div class="row g-4 mb-4">
            <div class="col-lg-7">
                <p class="lead text-muted">
                    Receive qualified inbound requests tied to real contract requirements — not a spammy lead dump.
                </p>
                <ul class="text-muted">
                    <li>Be discoverable only when contractors are non-compliant</li>
                    <li>Match by region and missing coverage type</li>
                    <li>Accept requests for quotes, document reviews, or contact</li>
                </ul>

                <div class="d-flex gap-2 flex-wrap">
                    <router-link to="/signup?role=brokerage" class="btn btn-dark">Create brokerage profile</router-link>
                    <router-link to="/login" class="btn btn-outline-dark">Log in</router-link>
                </div>
            </div>
            <div class="col-lg-5">
                <div class="card p-4">
                    <h5 class="mb-2">Coverage types</h5>
                    <p class="text-muted mb-0">
                        General liability, workers’ comp, commercial auto, umbrella, bonds.
                    </p>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-body">
                <h5 class="card-title">Inbound pipeline you can trust</h5>
                <p class="text-muted mb-0">
                    Requests include region + coverage gap context, and can be linked to a specific contract application.
                </p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ForBrokerages'
}
</script>

<style scoped>
.card {
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>

